import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from '../shared/errors/app-error.js';
import { sendError } from '../shared/schemas/api-response.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const requestId = (req.headers['x-request-id'] as string) || undefined;

  // Handle known AppError
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ err, requestId, path: req.path, method: req.method }, err.message);
    } else {
      logger.warn({ err: { message: err.message, code: err.code, details: err.details }, requestId, path: req.path, method: req.method }, err.message);
    }

    sendError(res, err.statusCode, err.code, err.message, err.details, requestId);
    return;
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
      code: e.code,
    }));
    sendError(res, 422, 'VALIDATION_ERROR', 'Request validation failed', details, requestId);
    return;
  }

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[])?.join(', ') || 'field';
      sendError(res, 409, 'CONFLICT', `A record with this ${target} already exists`, undefined, requestId);
      return;
    }
    if (err.code === 'P2025') {
      sendError(res, 404, 'NOT_FOUND', 'Requested database record was not found', undefined, requestId);
      return;
    }
  }

  // Handle SyntaxError (e.g. malformed JSON body)
  if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400) {
    sendError(res, 400, 'BAD_REQUEST', 'Malformed JSON payload in request body', undefined, requestId);
    return;
  }

  // Log unhandled unexpected errors
  console.error('SERVER ERROR CAUGHT:', err);
  logger.error(
    {
      err: {
        message: err.message,
        stack: env.isProduction ? undefined : err.stack,
      },
      requestId,
      path: req.path,
      method: req.method,
    },
    'Unhandled server error'
  );

  const message = env.isProduction ? 'Internal server error' : err.message;
  sendError(res, 500, 'INTERNAL_SERVER_ERROR', message, undefined, requestId);
}
