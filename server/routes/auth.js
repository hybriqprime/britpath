import express from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Try again in 15 minutes.' },
});

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const isEmail = (v) => typeof v === 'string' && /^\S+@\S+\.\S+$/.test(v);

// POST /api/auth/login
router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!isEmail(email) || typeof password !== 'string') {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !user.isActive || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({ token: signToken(user), user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', protect, (req, res) => {
  res.json({ user: req.user.toSafeObject() });
});

// POST /api/auth/clients  (admin creates a client account)
router.post('/clients', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !isEmail(email) || typeof password !== 'string' || password.length < 8) {
      return res
        .status(400)
        .json({ message: 'Name, valid email and a password of 8+ characters are required' });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ message: 'A user with this email already exists' });
    }

    const user = await User.create({ name, email, phone, password, role: 'client' });
    res.status(201).json({ user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/auth/password
router.patch('/password', protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be 8+ characters' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword || ''))) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (err) {
    next(err);
  }
});

export default router;