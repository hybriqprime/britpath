import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    // A token issued before the last password reset or sign-out-everywhere is rejected
    if (!user || !user.isActive || (decoded.tv ?? 0) !== user.tokenVersion) {
      return res.status(401).json({ message: 'Session expired. Please sign in again.' });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };

// Clients still on a temporary password may only change it
export const requirePasswordChanged = (req, res, next) => {
  if (req.user?.role === 'client' && req.user.mustChangePassword) {
    return res.status(403).json({
      code: 'PASSWORD_CHANGE_REQUIRED',
      message: 'Please set a new password first.',
    });
  }
  next();
};