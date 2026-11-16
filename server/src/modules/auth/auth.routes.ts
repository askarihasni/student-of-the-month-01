import { Router } from 'express';
import { authController } from './auth.controller.js';
import { validateRequest } from '../../middleware/validate-request.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authLimiter } from '../../middleware/rate-limit.js';
import { registerSchema, loginSchema, refreshTokenSchema } from './auth.schema.js';

export const authRouter = Router();

authRouter.post(
  '/register',
  authLimiter,
  validateRequest({ body: registerSchema }),
  authController.register
);

authRouter.post(
  '/login',
  authLimiter,
  validateRequest({ body: loginSchema }),
  authController.login
);

authRouter.post(
  '/refresh',
  validateRequest({ body: refreshTokenSchema }),
  authController.refresh
);

authRouter.post('/logout', authController.logout);

authRouter.post('/logout-all', authenticate, authController.logoutAll);

authRouter.get('/me', authenticate, authController.me);

