import { Router } from 'express';
import { aiController } from './ai.controller.js';
import { validateRequest } from '../../middleware/validate-request.js';
import { generateDesignSchema } from './ai.schemas.js';

export const aiRouter = Router();

aiRouter.post(
  '/generate',
  validateRequest({ body: generateDesignSchema }),
  (req, res, next) => aiController.generate(req, res, next)
);

aiRouter.get('/status', (req, res) => aiController.status(req, res));
