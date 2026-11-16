import type { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
    requestId?: string;
  };
}

export function sendSuccess<T>(
  res: Response,
  data?: T,
  statusCode: number = 200,
  message?: string
): Response {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(message ? { message } : {}),
  });
}

export function sendError(
  res: Response,
  statusCode: number = 500,
  code: string = 'INTERNAL_SERVER_ERROR',
  message: string = 'An unexpected error occurred',
  details?: unknown,
  requestId?: string
): Response {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
      ...(requestId ? { requestId } : {}),
    },
  });
}
