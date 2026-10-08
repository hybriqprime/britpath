import crypto from 'crypto';
import express from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { logActivity } from '../models/ActivityLog.js';
import { sendMail } from '../services/mailer.js';

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

const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many reset attempts. Please try again later.' },
});

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role, tv: user.tokenVersion }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const isEmail = (v) => typeof v === 'string' && /^\S+@\S+\.\S+$/.test(v);
const sha256 = (v) => crypto.createHash('sha256').update(v).digest('hex');
const escapeHtml = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

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

    user.$locals.ownerChose = true; // clears the "must change" flag
    user.$locals.keepSessions = true; // keeps this session signed in
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', resetLimiter, async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').toLowerCase().trim();
    // Same answer whether or not the account exists
    const generic = { message: 'If that email has an account, a reset link is on its way.' };

    if (!isEmail(email)) return res.json(generic);

    const user = await User.findOne({ email });

    if (user && user.isActive) {
      const token = crypto.randomBytes(32).toString('hex');
      user.passwordResetHash = sha256(token);
      user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();

      const appUrl = (
        process.env.APP_URL ||
        (process.env.CLIENT_URL || '').split(',')[0] ||
        ''
      ).replace(/\/$/, '');
      const link = `${appUrl}/reset-password?token=${token}`;
      const first = escapeHtml(user.name.split(' ')[0]);

      sendMail({
        to: user.email,
        subject: 'Reset your The BritPath password',
        text: `Hello ${user.name.split(' ')[0]},\n\nUse this link to choose a new password (it works for 60 minutes):\n${link}\n\nIf you did not ask for this, you can ignore this email.`,
        html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;color:#1e293b">
<h2 style="color:#12266e">Reset your password</h2>
<p>Hello ${first}, we received a request to reset your The BritPath password.</p>
<p><a href="${link}" style="display:inline-block;background:#c8102e;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:bold">Choose a new password</a></p>
<p style="font-size:13px;color:#64748b">This link works for 60 minutes. If you did not ask for this, you can ignore this email.</p></div>`,
      }).catch((err) => console.error('Reset email failed:', err.message));

      await logActivity(req, 'password_reset_requested', {
        actor: user._id,
        actorName: user.name,
        role: user.role,
      });
    }

    res.json(generic);
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/reset-password  { token, password }
router.post('/reset-password', resetLimiter, async (req, res, next) => {
  try {
    const { token, password } = req.body || {};

    if (typeof token !== 'string' || token.length < 40 || typeof password !== 'string' || password.length < 8) {
      return res
        .status(400)
        .json({ message: 'A valid reset link and a password of 8+ characters are required' });
    }

    const user = await User.findOne({
      passwordResetHash: sha256(token),
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user || !user.isActive) {
      return res.status(400).json({ message: 'This reset link is invalid or has expired.' });
    }

    user.$locals.ownerChose = true; // they chose it, so no forced change afterwards
    user.password = password; // other devices are signed out
    await user.save();

    await logActivity(req, 'password_reset_done', {
      actor: user._id,
      actorName: user.name,
      role: user.role,
    });

    res.json({ message: 'Password updated. You can now sign in.' });
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