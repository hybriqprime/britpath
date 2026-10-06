import express from 'express';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import Client from '../models/Client.js';
import { protect, requireRole } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.js';
import { STAGE_KEYS } from '../config/journey.js';
import { portalView } from '../utils/clientView.js';
import { storeUpload, signedUrl, destroyAsset } from '../services/documents.js';

const router = express.Router();
router.use(protect, requireRole('client'));

// Every portal route works only on the logged-in client's own record
router.use(async (req, res, next) => {
  try {
    const client = await Client.findOne({ user: req.user._id });
    if (!client) {
      return res.status(404).json({ message: 'No client profile found for this account' });
    }
    req.client = client;
    next();
  } catch (err) {
    next(err);
  }
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many uploads. Please try again later.' },
});

const str = (v, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : undefined);

const findDoc = (client, docId) =>
  mongoose.Types.ObjectId.isValid(docId) ? client.documents.id(docId) : null;

// GET /api/portal/me
router.get('/me', (req, res) => {
  res.json({ client: portalView(req.client, req.user) });
});

// POST /api/portal/documents  (multipart: file, label, stage)
router.post('/documents', uploadLimiter, uploadSingle, async (req, res, next) => {
  try {
    const client = req.client;

    if (client.documents.length >= 50) {
      return res.status(400).json({ message: 'Document limit reached. Please contact us.' });
    }

    const stage = STAGE_KEYS.includes(req.body?.stage) ? req.body.stage : undefined;
    const doc = await storeUpload({
      file: req.file,
      clientId: client._id,
      label: str(req.body?.label, 80) || 'Document',
      stage,
      uploadedBy: 'client',
    });

    client.documents.push(doc);
    await client.save();
    res.status(201).json({ client: portalView(client, req.user) });
  } catch (err) {
    next(err);
  }
});

// GET /api/portal/documents/:docId/url
router.get('/documents/:docId/url', async (req, res, next) => {
  try {
    const doc = findDoc(req.client, req.params.docId);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    res.json({ url: signedUrl(doc), expiresInSeconds: 300 });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/portal/documents/:docId  (only while not yet approved)
router.delete('/documents/:docId', async (req, res, next) => {
  try {
    const client = req.client;
    const doc = findDoc(client, req.params.docId);
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    if (doc.status === 'approved') {
      return res
        .status(403)
        .json({ message: 'Approved documents cannot be removed. Please contact us.' });
    }

    await destroyAsset(doc);
    client.documents.pull({ _id: doc._id });
    await client.save();
    res.json({ client: portalView(client, req.user) });
  } catch (err) {
    next(err);
  }
});

export default router;