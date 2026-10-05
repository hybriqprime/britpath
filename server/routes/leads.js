import express from 'express';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import Lead, { LEAD_STATUSES, SERVICES } from '../models/Lead.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

/* ---------- helpers ---------- */

const str = (v, max = 200) =>
  typeof v === 'string' ? v.trim().slice(0, max) : undefined;

const normalizePhone = (v) => {
  if (typeof v !== 'string') return '';
  const cleaned = v.replace(/[\s\-().]/g, '');
  return /^\+?\d{7,15}$/.test(cleaned) ? cleaned : '';
};

const isEmail = (v) => typeof v === 'string' && /^\S+@\S+\.\S+$/.test(v);

const toBool = (v) => v === true || v === 'true' || v === 'yes';

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const validId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: 'Lead not found' });
  }
  next();
};

/* ---------- PUBLIC: website intake form ---------- */

const intakeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many submissions. Please try again later.' },
});

// POST /api/leads/public
router.post('/public', intakeLimiter, async (req, res, next) => {
  try {
    const b = req.body || {};

    // Honeypot: real users never fill this hidden field. Pretend success for bots.
    if (b.website) return res.status(201).json({ message: 'Thank you' });

    const name = str(b.name, 120);
    const phone = normalizePhone(b.phone);

    if (!name || name.length < 2) {
      return res.status(400).json({ message: 'Please enter your full name' });
    }
    if (!phone) {
      return res.status(400).json({ message: 'Please enter a valid phone / WhatsApp number' });
    }
    if (b.email && !isEmail(b.email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }
    if (!toBool(b.consent)) {
      return res
        .status(400)
        .json({ message: 'Please agree to the privacy notice so we can contact you' });
    }

    const services = Array.isArray(b.services)
      ? b.services.filter((s) => SERVICES.includes(s))
      : [];

    // Same phone already in an open pipeline? Add a note instead of a duplicate.
    const existing = await Lead.findOne({
      phone,
      status: { $nin: ['lost', 'alumni'] },
    });

    if (existing) {
      existing.notes.push({
        text: `Re-submitted the intake form. Course: ${str(b.course, 160) || '-'}, intake: ${
          str(b.intake, 60) || '-'
        }, message: ${str(b.message, 500) || '-'}`,
        authorName: 'System',
      });
      await existing.save();
      return res.status(201).json({ message: 'Thank you. We will be in touch shortly.' });
    }

    await Lead.create({
      name,
      phone,
      email: isEmail(b.email) ? b.email : undefined,
      course: str(b.course, 160),
      level: str(b.level, 60),
      intake: str(b.intake, 60),
      budget: str(b.budget, 80),
      currentStatus: str(b.currentStatus, 160),
      visaRefusal: toBool(b.visaRefusal),
      ukTravelBefore: toBool(b.ukTravelBefore),
      services,
      message: str(b.message, 2000),
      source: str(b.source, 60) || 'website',
      status: 'enquiry',
      statusHistory: [{ status: 'enquiry' }],
      consent: true,
      consentAt: new Date(),
    });

    res.status(201).json({ message: 'Thank you. We will be in touch shortly.' });
  } catch (err) {
    next(err);
  }
});

/* ---------- ADMIN ---------- */

router.use(protect, requireRole('admin'));

// GET /api/leads/stats
router.get('/stats', async (req, res, next) => {
  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [byStatus, bySource, total, last7Days] = await Promise.all([
      Lead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Lead.aggregate([
        { $group: { _id: '$source', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Lead.countDocuments(),
      Lead.countDocuments({ createdAt: { $gte: weekAgo } }),
    ]);

    const statusCounts = Object.fromEntries(LEAD_STATUSES.map((s) => [s, 0]));
    byStatus.forEach((r) => (statusCounts[r._id] = r.count));

    res.json({
      total,
      last7Days,
      byStatus: statusCounts,
      bySource: bySource.map((r) => ({ source: r._id, count: r.count })),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/leads?status=&q=&source=&page=&limit=
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);

    const filter = {};

    if (typeof req.query.status === 'string' && LEAD_STATUSES.includes(req.query.status)) {
      filter.status = req.query.status;
    }
    if (typeof req.query.source === 'string' && req.query.source) {
      filter.source = req.query.source;
    }
    if (typeof req.query.q === 'string' && req.query.q.trim()) {
      const rx = new RegExp(escapeRegex(req.query.q.trim().slice(0, 60)), 'i');
      filter.$or = [{ name: rx }, { phone: rx }, { email: rx }, { course: rx }];
    }

    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .select('-notes -statusHistory')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Lead.countDocuments(filter),
    ]);

    res.json({ leads, total, page, pages: Math.ceil(total / limit) || 1 });
  } catch (err) {
    next(err);
  }
});

// GET /api/leads/:id
router.get('/:id', validId, async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json({ lead });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/leads/:id  (edit fields / move through the pipeline)
router.patch('/:id', validId, async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    const b = req.body || {};

    if (b.status !== undefined) {
      if (!LEAD_STATUSES.includes(b.status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      if (b.status !== lead.status) {
        lead.status = b.status;
        lead.statusHistory.push({ status: b.status, by: req.user._id });
      }
    }

    const textFields = [
      ['name', 120],
      ['email', 160],
      ['course', 160],
      ['level', 60],
      ['intake', 60],
      ['budget', 80],
      ['currentStatus', 160],
      ['lostReason', 120],
      ['source', 60],
    ];
    for (const [key, max] of textFields) {
      if (b[key] !== undefined) lead[key] = str(b[key], max);
    }

    if (b.phone !== undefined) {
      const phone = normalizePhone(b.phone);
      if (!phone) return res.status(400).json({ message: 'Invalid phone number' });
      lead.phone = phone;
    }

    if (b.visaRefusal !== undefined) lead.visaRefusal = toBool(b.visaRefusal);
    if (b.ukTravelBefore !== undefined) lead.ukTravelBefore = toBool(b.ukTravelBefore);

    if (Array.isArray(b.tags)) {
      lead.tags = b.tags.map((t) => str(t, 40)).filter(Boolean).slice(0, 20);
    }
    if (Array.isArray(b.services)) {
      lead.services = b.services.filter((s) => SERVICES.includes(s));
    }

    await lead.save();
    res.json({ lead });
  } catch (err) {
    next(err);
  }
});

// POST /api/leads/:id/notes
router.post('/:id/notes', validId, async (req, res, next) => {
  try {
    const text = str(req.body?.text, 2000);
    if (!text) return res.status(400).json({ message: 'Note text is required' });

    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    lead.notes.push({ text, author: req.user._id, authorName: req.user.name });
    await lead.save();

    res.status(201).json({ lead });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/leads/:id
router.delete('/:id', validId, async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json({ message: 'Lead deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;