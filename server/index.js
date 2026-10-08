import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import leadRoutes from './routes/leads.js';
import clientRoutes from './routes/clients.js';
import portalRoutes from './routes/portal.js';
import activityRoutes from './routes/activity.js';
import { auditDocumentAccess, auditWrites } from './middleware/audit.js';

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set in .env');
  process.exit(1);
}

const isProd = process.env.NODE_ENV === 'production';
const app = express();

// Needed so rate limiting sees the real client IP behind Codespaces/Render/Vercel proxies
app.set('trust proxy', 1);

const allowedOrigins = (process.env.CLIENT_URL || '').split(',').map((s) => s.trim());

app.use(helmet());
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      const err = new Error('Not allowed by CORS');
      err.status = 403;
      cb(err);
    },
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(mongoSanitize()); // strips $ and . operators from request bodies and queries
app.use(morgan(isProd ? 'combined' : 'dev'));

app.get('/api/health', (req, res) => {
  const up = mongoose.connection.readyState === 1;
  res.status(up ? 200 : 503).json({ status: up ? 'ok' : 'degraded', app: 'BritPath API' });
});

// Audit trail (runs when each response finishes)
app.use('/api/clients/:id/documents/:docId/url', auditDocumentAccess);
app.use('/api/portal/documents/:docId/url', auditDocumentAccess);
app.use('/api/clients', auditWrites);
app.use('/api/portal', auditWrites);

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/portal', portalRoutes);
app.use('/api/activity', activityRoutes);

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON in request' });
  }

  const status = err.status || 500;
  if (status >= 500) console.error(err);

  res.status(status).json({
    message:
      status >= 500 && isProd
        ? 'Something went wrong. Please try again.'
        : err.message || 'Server error',
  });
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => app.listen(PORT, () => console.log(`BritPath API running on port ${PORT}`)))
  .catch((err) => {
    console.error('Startup failed:', err.message);
    process.exit(1);
  });