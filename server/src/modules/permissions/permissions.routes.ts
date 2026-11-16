import { Router } from 'express';
import { permissionsController } from './permissions.controller.js';
import { authenticate, optionalAuthenticate } from '../../middleware/authenticate.js';
import { authorizeDocument } from '../../middleware/authorize.js';
import { validateRequest } from '../../middleware/validate-request.js';
import { inviteCollaboratorSchema, updatePermissionSchema } from './permissions.schema.js';
import { Role } from '@prisma/client';

export const permissionsRouter = Router({ mergeParams: true });

permissionsRouter.post(
  '/',
  authenticate,
  authorizeDocument(Role.OWNER),
  validateRequest({ body: inviteCollaboratorSchema }),
  permissionsController.inviteCollaborator
);

permissionsRouter.get(
  '/',
  optionalAuthenticate,
  authorizeDocument(Role.VIEWER),
  permissionsController.listPermissions
);

permissionsRouter.patch(
  '/:permissionId',
  authenticate,
  authorizeDocument(Role.OWNER),
  validateRequest({ body: updatePermissionSchema }),
  permissionsController.updatePermission
);

permissionsRouter.delete(
  '/:permissionId',
  authenticate,
  authorizeDocument(Role.OWNER),
  permissionsController.revokePermission
);
