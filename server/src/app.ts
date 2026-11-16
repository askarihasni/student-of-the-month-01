import express from 'express';
import path from 'node:path';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { prisma } from './database/prisma.js';
import { requestIdMiddleware } from './middleware/request-id.js';
import { generalLimiter } from './middleware/rate-limit.js';
import { errorHandler } from './middleware/error-handler.js';
import { NotFoundError } from './shared/errors/app-error.js';
import { sendSuccess } from './shared/schemas/api-response.js';
import { swaggerSpec } from './docs/swagger.js';

import { authRouter } from './modules/auth/auth.routes.js';
import { usersRouter } from './modules/users/users.routes.js';
import { documentsRouter } from './modules/documents/documents.routes.js';
import { versionsRouter } from './modules/versions/versions.routes.js';
import { permissionsRouter } from './modules/permissions/permissions.routes.js';
import { assetsRouter } from './modules/assets/assets.routes.js';
import { commentsRouter } from './modules/comments/comments.routes.js';
import { documentExportsRouter, exportsRouter } from './modules/exports/exports.routes.js';

export const app = express();

// Security and utility middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow localhost, 127.0.0.1, or no origin (like mobile/curl) in dev
      if (!origin || !env.isProduction) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(
  (pinoHttp as any)({
    logger,
    autoLogging: !env.isTest,
  })
);

app.use(requestIdMiddleware);

// Static uploads serving
const uploadsDir = process.cwd().endsWith('server')
  ? path.resolve(process.cwd(), 'uploads')
  : path.resolve(process.cwd(), 'server', 'uploads');
app.use(
  '/uploads',
  express.static(uploadsDir, {
    maxAge: '7d',
    setHeaders: (res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
    },
  })
);

// General rate limiter on API endpoints
app.use('/api', generalLimiter);

// Health check endpoints
const healthHandler = async (_req: express.Request, res: express.Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    sendSuccess(res, {
      status: 'healthy',
      database: 'connected',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      database: 'disconnected',
      error: (error as Error).message,
    });
  }
};

app.get('/healthz', healthHandler);
app.get('/api/health', healthHandler);

// API Documentation
app.get('/api/docs/json', (_req, res) => {
  res.json(swaggerSpec);
});
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mount module routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/documents/:id/versions', versionsRouter);
app.use('/api/documents/:id/permissions', permissionsRouter);
app.use('/api/documents/:id/assets', assetsRouter);
app.use('/api/documents/:id/comments', commentsRouter);
app.use('/api/documents/:id/exports', documentExportsRouter);
app.use('/api/exports', exportsRouter);

// 404 Route handler
app.use((_req, _res, next) => {
  next(new NotFoundError('The requested endpoint was not found'));
});

// Centralized error handler
app.use(errorHandler);
