import express from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { logActivity } from '../models/ActivityLog.js';

const router = express.Router();

const base = {
  windowMs: 15 * 60 * 1000,
  skipSuccessfulRequests: true, // only failed attempts count
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Try again in 15 minutes.' },
};

// Per IP
const ipLimiter = rateLimit({ ...base, max: 20 });

// Per account: slows guessing against one email from many IPs
const accountLimiter = rateLimit({
  ...base,
  max: 8,
  keyGenerator: (req) =>
    String(req.body?.email || '').toLowerCase().slice(0, 160) || req.ip,
});

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role, tv: user.tokenVersion }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const isEmail = (v) => typeof v === 'string' && /^\S+@\S+\.\S+$/.test(v);

// POST /api/auth/login
router.post('/login', ipLimiter, accountLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!isEmail(email) || typeof password !== 'string') {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    const ok = user && user.isActive && (await user.comparePassword(password));

    if (!ok) {
      await logActivity(req, 'login_failed', {
        meta: { email: email.toLowerCase().slice(0, 160) },
      });
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    user.lastLoginAt = new Date();
    await user.save();

    await logActivity(req, 'login', {
      actor: user._id,
      actorName: user.name,
      role: user.role,
    });

    res.json({ token: signToken(user), user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', protect, (req, res) => {
  res.json({ user: req.user.toSafeObject() });
});

// PATCH /api/auth/password
router.patch('/password', protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body || {};

    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be 8+ characters' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword || ''))) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.$locals.selfChange = true; // keeps the current session signed in
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout-all  (signs the account out on every device, including this one)
router.post('/logout-all', protect, async (req, res, next) => {
  try {
    req.user.tokenVersion += 1;
    await req.user.save();
    res.json({ message: 'Signed out everywhere' });
  } catch (err) {
    next(err);
  }
});

export default router;