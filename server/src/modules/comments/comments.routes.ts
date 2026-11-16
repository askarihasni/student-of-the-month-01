import { Router } from 'express';
import { commentsController } from './comments.controller.js';
import { authenticate, optionalAuthenticate } from '../../middleware/authenticate.js';
import { authorizeDocument } from '../../middleware/authorize.js';
import { validateRequest } from '../../middleware/validate-request.js';
import {
  createCommentSchema,
  replyCommentSchema,
  updateCommentSchema,
} from './comments.schema.js';
import { Role } from '@prisma/client';

export const commentsRouter = Router({ mergeParams: true });

commentsRouter.post(
  '/',
  authenticate,
  authorizeDocument(Role.VIEWER),
  validateRequest({ body: createCommentSchema }),
  commentsController.createComment
);

commentsRouter.get(
  '/',
  optionalAuthenticate,
  authorizeDocument(Role.VIEWER),
  commentsController.listComments
);

commentsRouter.post(
  '/:commentId/replies',
  authenticate,
  authorizeDocument(Role.VIEWER),
  validateRequest({ body: replyCommentSchema }),
  commentsController.replyComment
);

commentsRouter.patch(
  '/:commentId',
  authenticate,
  authorizeDocument(Role.VIEWER),
  validateRequest({ body: updateCommentSchema }),
  commentsController.updateComment
);

commentsRouter.delete(
  '/:commentId',
  authenticate,
  authorizeDocument(Role.VIEWER),
  commentsController.deleteComment
);
