import express from 'express';
import session from 'express-session';
import cors from 'cors';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import connectPgSimple from 'connect-pg-simple';
import { env } from './config/env';
import { errorHandler } from './middleware/error';
import { authRoutes } from './routes/auth.routes';
import { contractRoutes } from './routes/contract.routes';
import { partnerRoutes } from './routes/partner.routes';
import { attachmentRoutes } from './routes/attachment.routes';
import { dashboardRoutes } from './routes/dashboard.routes';
import { notificationRoutes } from './routes/notification.routes';
import { userRoutes } from './routes/user.routes';
import { exportRoutes } from './routes/export.routes';
import { startExpiryCheckJob } from './jobs/expiry-check';
import { logger } from './utils/logger';

export const prisma = new PrismaClient();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Session
const PgSession = connectPgSimple(session);
app.use(session({
  store: new PgSession({
    conString: env.databaseUrl,
    createTableIfMissing: true,
  }),
  secret: env.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'lax',
  },
}));

// Static files for uploads (requires auth - handled in attachment routes)
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/attachments', attachmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/export', exportRoutes);

// Health check with DB status
app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'error', database: 'disconnected', timestamp: new Date().toISOString() });
  }
});

// Error handler
app.use(errorHandler);

// Start server
// Request logging middleware
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`, { ip: req.ip });
  next();
});

// Start server
app.listen(env.port, () => {
  logger.info(`Server running on port ${env.port}`);
  startExpiryCheckJob();
});

export default app;
