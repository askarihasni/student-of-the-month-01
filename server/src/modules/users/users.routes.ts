import { Router } from 'express';
import { usersController } from './users.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validateRequest } from '../../middleware/validate-request.js';
import { updateProfileSchema, searchUsersQuerySchema } from './users.schema.js';

export const usersRouter = Router();

usersRouter.use(authenticate);

usersRouter.patch(
  '/profile',
  validateRequest({ body: updateProfileSchema }),
  usersController.updateProfile
);

usersRouter.get(
  '/search',
  validateRequest({ query: searchUsersQuerySchema }),
  usersController.searchUsers
);
