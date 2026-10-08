import express from 'express';
import ActivityLog from '../models/ActivityLog.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();
router.use(protect, requireRole('admin'));

// GET /api/activity?action=login_failed&limit=100
router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 100, 1), 500);
    const filter = {};
    if (typeof req.query.action === 'string' && req.query.action) {
      filter.action = req.query.action.slice(0, 40);
    }

    const items = await ActivityLog.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

export default router;