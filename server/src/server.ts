import http from 'node:http';
import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { prisma } from './database/prisma.js';
import { collaborationGateway } from './modules/collaboration/collaboration.gateway.js';

const httpServer = http.createServer(app);

// Attach Socket.IO
collaborationGateway.initialize(httpServer);

const PORT = env.PORT;

const server = httpServer.listen(PORT, '0.0.0.0', () => {
  logger.info(`Vectorly API Server started running on http://localhost:${PORT}`);
  logger.info(`Swagger API Documentation available at http://localhost:${PORT}/api/docs`);
  logger.info(`Health check active at http://localhost:${PORT}/healthz`);
});

// Graceful shutdown handling
const handleShutdown = async (signal: string) => {
  logger.info(`${signal} signal received: closing HTTP server and database pool...`);

  server.close(async () => {
    logger.info('HTTP server closed');
    try {
      await prisma.$disconnect();
      logger.info('Prisma disconnected successfully');
      process.exit(0);
    } catch (err) {
      logger.error({ err }, 'Error during database disconnect');
      process.exit(1);
    }
  });

  // Force shutdown after 10s timeout
  setTimeout(() => {
    logger.error('Forced shutdown due to timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

