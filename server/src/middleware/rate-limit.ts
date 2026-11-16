import rateLimit from 'express-rate-limit';
import { RateLimitError } from '../shared/errors/app-error.js';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(new RateLimitError('Too many requests, please try again later'));
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per 15 mins for login/register
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(new RateLimitError('Too many authentication attempts, please try again after 15 minutes'));
  },
});

export const syncLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // 120 sync requests per minute (2 per second max)
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(new RateLimitError('Document sync rate limit exceeded, throttling requests'));
  },
});

