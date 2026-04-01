import express from 'express';
import session from 'express-session';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
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
  origin: env.nodeEnv === 'production' ? true : 'http://localhost:5173',
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
    secure: false,
    sameSite: 'lax',
  },
}));

// Request logging middleware
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`, { ip: req.ip });
  next();
});

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/attachments', attachmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/export', exportRoutes);

// Health check
app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'error', database: 'disconnected', timestamp: new Date().toISOString() });
  }
});

// Serve client static files (SPA)
const clientDistPath = path.resolve(__dirname, '..', '..', 'client', 'dist');
const clientIndexPath = path.join(clientDistPath, 'index.html');
logger.info(`Client dist path: ${clientDistPath}`);
logger.info(`Client index.html exists: ${fs.existsSync(clientIndexPath)}`);

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (_req, res) => {
    res.sendFile(clientIndexPath);
  });
  logger.info('SPA static file serving enabled');
} else {
  logger.warn(`Client dist not found at ${clientDistPath} - SPA serving disabled`);
}

// Error handler
app.use(errorHandler);

// Start server
app.listen(env.port, () => {
  logger.info(`Server running on port ${env.port}`);
  logger.info(`NODE_ENV: ${env.nodeEnv}`);
  logger.info(`__dirname: ${__dirname}`);
  logger.info(`CWD: ${process.cwd()}`);
  startExpiryCheckJob();
});

export default app;
