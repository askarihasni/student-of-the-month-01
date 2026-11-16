import { Router } from 'express';
import { versionsController } from './versions.controller.js';
import { authenticate, optionalAuthenticate } from '../../middleware/authenticate.js';
import { authorizeDocument } from '../../middleware/authorize.js';
import { validateRequest } from '../../middleware/validate-request.js';
import { createVersionSchema } from './versions.schema.js';
import { Role } from '@prisma/client';

export const versionsRouter = Router({ mergeParams: true });

versionsRouter.post(
  '/',
  authenticate,
  authorizeDocument(Role.EDITOR),
  validateRequest({ body: createVersionSchema }),
  versionsController.createVersion
);

versionsRouter.get(
  '/',
  optionalAuthenticate,
  authorizeDocument(Role.VIEWER),
  versionsController.listVersions
);

versionsRouter.get(
  '/:versionId',
  optionalAuthenticate,
  authorizeDocument(Role.VIEWER),
  versionsController.getVersion
);

versionsRouter.post(
  '/:versionId/restore',
  authenticate,
  authorizeDocument(Role.EDITOR),
  versionsController.restoreVersion
);

