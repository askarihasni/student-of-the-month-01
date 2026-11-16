import { Router } from 'express';
import { documentsController } from './documents.controller.js';
import { authenticate, optionalAuthenticate } from '../../middleware/authenticate.js';
import { authorizeDocument } from '../../middleware/authorize.js';
import { validateRequest } from '../../middleware/validate-request.js';
import { syncLimiter } from '../../middleware/rate-limit.js';
import {
  createDocumentSchema,
  updateDocumentSchema,
  syncDocumentSchema,
  listDocumentsQuerySchema,
} from './documents.schema.js';
import { Role } from '@prisma/client';

export const documentsRouter = Router();

documentsRouter.post(
  '/',
  authenticate,
  validateRequest({ body: createDocumentSchema }),
  documentsController.createDocument
);

documentsRouter.get(
  '/',
  authenticate,
  validateRequest({ query: listDocumentsQuerySchema }),
  documentsController.listDocuments
);

documentsRouter.get(
  '/:id',
  optionalAuthenticate,
  authorizeDocument(Role.VIEWER),
  documentsController.getDocumentById
);

documentsRouter.patch(
  '/:id',
  authenticate,
  authorizeDocument(Role.EDITOR),
  validateRequest({ body: updateDocumentSchema }),
  documentsController.updateMetadata
);

documentsRouter.delete(
  '/:id',
  authenticate,
  authorizeDocument(Role.OWNER),
  documentsController.deleteDocument
);

documentsRouter.post(
  '/:id/duplicate',
  authenticate,
  authorizeDocument(Role.VIEWER),
  documentsController.duplicateDocument
);

documentsRouter.patch(
  '/:id/sync',
  authenticate,
  authorizeDocument(Role.EDITOR),
  syncLimiter,
  validateRequest({ body: syncDocumentSchema }),
  documentsController.syncDocument
);

