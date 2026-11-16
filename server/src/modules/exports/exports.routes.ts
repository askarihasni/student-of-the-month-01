import { Router } from 'express';
import { exportsController } from './exports.controller.js';
import { authenticate, optionalAuthenticate } from '../../middleware/authenticate.js';
import { authorizeDocument } from '../../middleware/authorize.js';
import { validateRequest } from '../../middleware/validate-request.js';
import { createExportSchema } from './exports.schema.js';
import { Role } from '@prisma/client';

export const documentExportsRouter = Router({ mergeParams: true });

documentExportsRouter.post(
  '/',
  authenticate,
  authorizeDocument(Role.VIEWER),
  validateRequest({ body: createExportSchema }),
  exportsController.createExport
);

export const exportsRouter = Router();

exportsRouter.get('/:jobId', optionalAuthenticate, exportsController.getExportStatus);
exportsRouter.get('/:jobId/download', exportsController.downloadExport);
