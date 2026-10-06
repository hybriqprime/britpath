import express from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Lead from '../models/Lead.js';
import Client from '../models/Client.js';
import { protect, requireRole } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.js';
import { STAGE_KEYS, buildChecklist } from '../config/journey.js';
import { adminView, progressOf } from '../utils/clientView.js';
import { storeUpload, signedUrl, destroyAsset } from '../services/documents.js';

const router = express.Router();
router.use(protect, requireRole('admin'));

/* ---------- helpers ---------- */

const str = (v, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : undefined);
const isEmail = (v) => typeof v === 'string' && /^\S+@\S+\.\S+$/.test(v);
const toDate = (v) => {
  if (!v) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
};
const makePassword = () => crypto.randomBytes(9).toString('base64url');

const validId = (req, res, next) =>
  mongoose.Types.ObjectId.isValid(req.params.id)
    ? next()
    : res.status(404).json({ message: 'Client not found' });

const findClient = (id) => Client.findById(id).populate('user', 'name email phone isActive');

const notFound = (res, what = 'Client') => res.status(404).json({ message: `${what} not found` });

const sendClient = (res, client, status = 200, extra = {}) =>
  res.status(status).json({ client: adminView(client, client.user), ...extra });

/* ---------- list / create ---------- */

// GET /api/clients
router.get('/', async (req, res, next) => {
  try {
    const clients = await Client.find()
      .populate('user', 'name email phone isActive')
      .sort({ createdAt: -1 });

    res.json({
      clients: clients.map((c) => ({
        id: c._id,
        name: c.user?.name,
        email: c.user?.email,
        phone: c.user?.phone,
        isActive: c.user?.isActive,
        package: c.package || '',
        currentStage: c.currentStage,
        progress: progressOf(c).overall,
        pendingDocs: c.documents.filter((d) => d.status === 'pending').length,
        createdAt: c.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/clients  (convert a lead into a client, or create one directly)
router.post('/', async (req, res, next) => {
  let user = null;
  try {
    const b = req.body || {};

    let lead = null;
    if (b.leadId) {
      if (!mongoose.Types.ObjectId.isValid(b.leadId)) return notFound(res, 'Lead');
      lead = await Lead.findById(b.leadId);
      if (!lead) return notFound(res, 'Lead');
      if (await Client.findOne({ lead: lead._id })) {
        return res.status(409).json({ message: 'This lead already has a client account' });
      }
    }

    const name = str(b.name, 120) || lead?.name;
    const email = (str(b.email, 160) || lead?.email || '').toLowerCase();
    const phone = str(b.phone, 30) || lead?.phone;

    if (!name || !isEmail(email)) {
      return res
        .status(400)
        .json({ message: 'A name and a valid email are required (add the email to the lead first)' });
    }
    if (await User.findOne({ email })) {
      return res.status(409).json({ message: 'A user with this email already exists' });
    }

    const supplied = str(b.password, 100);
    if (supplied && supplied.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }
    const password = supplied || makePassword();

    user = await User.create({ name, email, phone, password, role: 'client' });

    const client = await Client.create({
      user: user._id,
      lead: lead?._id,
      package: str(b.package, 120),
      course: str(b.course, 160) || lead?.course,
      university: str(b.university, 160),
      intake: str(b.intake, 60) || lead?.intake,
      checklist: buildChecklist(),
    });

    // A paying client moves the lead to "Paid" if it was still earlier in the pipeline
    if (lead && ['enquiry', 'qualified', 'booked'].includes(lead.status)) {
      lead.status = 'paid';
      lead.statusHistory.push({ status: 'paid', by: req.user._id });
      await lead.save();
    }

    sendClient(res, { ...client.toObject(), user, checklist: client.checklist, documents: client.documents, notes: client.notes, lead: client.lead }, 201, {
      temporaryPassword: supplied ? null : password,
    });
  } catch (err) {
    if (user) await User.findByIdAndDelete(user._id).catch(() => {});
    next(err);
  }
});

/* ---------- one client ---------- */

// GET /api/clients/:id
router.get('/:id', validId, async (req, res, next) => {
  try {
    const client = await findClient(req.params.id);
    if (!client) return notFound(res);
    sendClient(res, client);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/clients/:id
router.patch('/:id', validId, async (req, res, next) => {
  try {
    const client = await findClient(req.params.id);
    if (!client) return notFound(res);

    const b = req.body || {};
    for (const [key, max] of [
      ['package', 120],
      ['course', 160],
      ['university', 160],
      ['intake', 60],
    ]) {
      if (b[key] !== undefined) client[key] = str(b[key], max);
    }

    if (b.currentStage !== undefined) {
      if (!STAGE_KEYS.includes(b.currentStage)) {
        return res.status(400).json({ message: 'Invalid stage' });
      }
      client.currentStage = b.currentStage;
    }

    await client.save();

    if (b.isActive !== undefined && client.user) {
      client.user.isActive = b.isActive === true || b.isActive === 'true';
      await client.user.save();
    }

    sendClient(res, client);
  } catch (err) {
    next(err);
  }
});

// POST /api/clients/:id/reset-password
router.post('/:id/reset-password', validId, async (req, res, next) => {
  try {
    const client = await findClient(req.params.id);
    if (!client || !client.user) return notFound(res);

    const supplied = str(req.body?.password, 100);
    if (supplied && supplied.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }
    const password = supplied || makePassword();

    const user = await User.findById(client.user._id);
    user.password = password;
    await user.save();

    res.json({ message: 'Password reset', temporaryPassword: supplied ? null : password });
  } catch (err) {
    next(err);
  }
});

/* ---------- checklist ---------- */

// POST /api/clients/:id/checklist
router.post('/:id/checklist', validId, async (req, res, next) => {
  try {
    const title = str(req.body?.title, 200);
    if (!title) return res.status(400).json({ message: 'Title is required' });
    if (!STAGE_KEYS.includes(req.body?.stage)) {
      return res.status(400).json({ message: 'Invalid stage' });
    }

    const client = await findClient(req.params.id);
    if (!client) return notFound(res);

    client.checklist.push({
      stage: req.body.stage,
      title,
      dueDate: toDate(req.body.dueDate),
    });
    await client.save();
    sendClient(res, client, 201);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/clients/:id/checklist/:itemId
router.patch('/:id/checklist/:itemId', validId, async (req, res, next) => {
  try {
    const client = await findClient(req.params.id);
    if (!client) return notFound(res);

    const item = mongoose.Types.ObjectId.isValid(req.params.itemId)
      ? client.checklist.id(req.params.itemId)
      : null;
    if (!item) return notFound(res, 'Checklist item');

    const b = req.body || {};
    if (b.done !== undefined) {
      item.done = b.done === true || b.done === 'true';
      item.doneAt = item.done ? new Date() : undefined;
    }
    if (b.title !== undefined) {
      const title = str(b.title, 200);
      if (!title) return res.status(400).json({ message: 'Title cannot be empty' });
      item.title = title;
    }
    if (b.dueDate !== undefined) item.dueDate = toDate(b.dueDate);

    await client.save();
    sendClient(res, client);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/clients/:id/checklist/:itemId
router.delete('/:id/checklist/:itemId', validId, async (req, res, next) => {
  try {
    const client = await findClient(req.params.id);
    if (!client) return notFound(res);

    const item = mongoose.Types.ObjectId.isValid(req.params.itemId)
      ? client.checklist.id(req.params.itemId)
      : null;
    if (!item) return notFound(res, 'Checklist item');

    client.checklist.pull({ _id: item._id });
    await client.save();
    sendClient(res, client);
  } catch (err) {
    next(err);
  }
});

/* ---------- notes ---------- */

// POST /api/clients/:id/notes  { text, visibleToClient }
router.post('/:id/notes', validId, async (req, res, next) => {
  try {
    const text = str(req.body?.text, 2000);
    if (!text) return res.status(400).json({ message: 'Note text is required' });

    const client = await findClient(req.params.id);
    if (!client) return notFound(res);

    client.notes.push({
      text,
      visibleToClient: req.body.visibleToClient === true || req.body.visibleToClient === 'true',
      authorName: req.user.name,
    });
    await client.save();
    sendClient(res, client, 201);
  } catch (err) {
    next(err);
  }
});

/* ---------- documents ---------- */

// POST /api/clients/:id/documents  (multipart: file, label, stage)
router.post('/:id/documents', validId, uploadSingle, async (req, res, next) => {
  try {
    const client = await findClient(req.params.id);
    if (!client) return notFound(res);

    if (client.documents.length >= 100) {
      return res.status(400).json({ message: 'Document limit reached for this client' });
    }

    const stage = STAGE_KEYS.includes(req.body?.stage) ? req.body.stage : undefined;
    const doc = await storeUpload({
      file: req.file,
      clientId: client._id,
      label: str(req.body?.label, 80) || 'Document',
      stage,
      uploadedBy: 'admin',
    });

    client.documents.push(doc);
    await client.save();
    sendClient(res, client, 201);
  } catch (err) {
    next(err);
  }
});

// GET /api/clients/:id/documents/:docId/url  (link expires in 5 minutes)
router.get('/:id/documents/:docId/url', validId, async (req, res, next) => {
  try {
    const client = await findClient(req.params.id);
    if (!client) return notFound(res);

    const doc = mongoose.Types.ObjectId.isValid(req.params.docId)
      ? client.documents.id(req.params.docId)
      : null;
    if (!doc) return notFound(res, 'Document');

    res.json({ url: signedUrl(doc), expiresInSeconds: 300 });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/clients/:id/documents/:docId  { status, reviewNote }
router.patch('/:id/documents/:docId', validId, async (req, res, next) => {
  try {
    const client = await findClient(req.params.id);
    if (!client) return notFound(res);

    const doc = mongoose.Types.ObjectId.isValid(req.params.docId)
      ? client.documents.id(req.params.docId)
      : null;
    if (!doc) return notFound(res, 'Document');

    const b = req.body || {};
    if (b.status !== undefined) {
      if (!['pending', 'approved', 'rejected'].includes(b.status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      doc.status = b.status;
    }
    if (b.reviewNote !== undefined) doc.reviewNote = str(b.reviewNote, 300);

    await client.save();
    sendClient(res, client);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/clients/:id/documents/:docId
router.delete('/:id/documents/:docId', validId, async (req, res, next) => {
  try {
    const client = await findClient(req.params.id);
    if (!client) return notFound(res);

    const doc = mongoose.Types.ObjectId.isValid(req.params.docId)
      ? client.documents.id(req.params.docId)
      : null;
    if (!doc) return notFound(res, 'Document');

    await destroyAsset(doc);
    client.documents.pull({ _id: doc._id });
    await client.save();
    sendClient(res, client);
  } catch (err) {
    next(err);
  }
});

export default router;