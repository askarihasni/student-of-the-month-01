import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { prisma } from '../database/prisma.js';
import { ForbiddenError, NotFoundError, UnauthorizedError } from '../shared/errors/app-error.js';

declare global {
  namespace Express {
    interface Request {
      documentRole?: Role;
      targetDocument?: any;
    }
  }
}

/**
 * Checks document permissions for the authenticated user.
 * Required minimum role can be VIEWER, EDITOR, or OWNER.
 */
export function authorizeDocument(requiredRole: Role = Role.VIEWER) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const documentId = req.params.id || req.params.documentId;
      if (!documentId) {
        throw new NotFoundError('Document identifier missing');
      }

      const document = await prisma.document.findUnique({
        where: { id: documentId },
        include: {
          permissions: true,
        },
      });

      if (!document || document.isDeleted) {
        throw new NotFoundError('Document not found');
      }

      const userId = req.user?.id;

      // Check if user is owner directly
      if (userId && document.ownerId === userId) {
        req.documentRole = Role.OWNER;
        req.targetDocument = document;
        return next();
      }

      // Check permissions table
      const userPermission = userId
        ? document.permissions.find((p) => p.userId === userId)
        : null;

      let effectiveRole: Role | null = userPermission ? userPermission.role : null;

      // If document is public and required role is VIEWER, allow read access
      if (!effectiveRole && document.isPublic && requiredRole === Role.VIEWER) {
        effectiveRole = Role.VIEWER;
      }

      if (!effectiveRole) {
        if (!userId) {
          throw new UnauthorizedError('Authentication required to access this document');
        }
        throw new ForbiddenError('You do not have permission to access this document');
      }

      // Role hierarchy check: OWNER > EDITOR > VIEWER
      const roleWeight: Record<Role, number> = {
        [Role.VIEWER]: 1,
        [Role.EDITOR]: 2,
        [Role.OWNER]: 3,
      };

      if (roleWeight[effectiveRole] < roleWeight[requiredRole]) {
        throw new ForbiddenError(
          `Action requires ${requiredRole} permissions, but you only have ${effectiveRole} access`
        );
      }

      req.documentRole = effectiveRole;
      req.targetDocument = document;
      next();
    } catch (error) {
      next(error);
    }
  };
}
