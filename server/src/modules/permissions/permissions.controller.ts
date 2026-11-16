import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../database/prisma.js';
import { sendSuccess } from '../../shared/schemas/api-response.js';
import { NotFoundError, BadRequestError } from '../../shared/errors/app-error.js';
import { Role } from '@prisma/client';

export class PermissionsController {
  async inviteCollaborator(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const documentId = req.params.id;
      const { email, role } = req.body;

      const targetUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: { id: true, email: true, name: true, avatarUrl: true },
      });

      if (!targetUser) {
        throw new NotFoundError(`No user found with email "${email}". The collaborator must create a Vectorly account first.`);
      }

      const doc = await prisma.document.findUnique({
        where: { id: documentId },
        select: { ownerId: true },
      });

      if (!doc) {
        throw new NotFoundError('Document not found');
      }

      if (doc.ownerId === targetUser.id) {
        throw new BadRequestError('User is already the owner of this document');
      }

      const permission = await prisma.documentPermission.upsert({
        where: {
          documentId_userId: {
            documentId,
            userId: targetUser.id,
          },
        },
        create: {
          documentId,
          userId: targetUser.id,
          role,
        },
        update: {
          role,
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      });

      sendSuccess(res, { permission }, 201);
    } catch (error) {
      next(error);
    }
  }

  async listPermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const documentId = req.params.id;

      const doc = await prisma.document.findUnique({
        where: { id: documentId },
        include: {
          owner: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
          permissions: {
            include: {
              user: {
                select: { id: true, name: true, email: true, avatarUrl: true },
              },
            },
          },
        },
      });

      if (!doc) {
        throw new NotFoundError('Document not found');
      }

      const collaborators = [
        {
          id: `owner_${doc.owner.id}`,
          user: doc.owner,
          role: Role.OWNER,
          isOwner: true,
        },
        ...doc.permissions.map((p) => ({
          id: p.id,
          user: p.user,
          role: p.role,
          isOwner: false,
        })),
      ];

      sendSuccess(res, {
        isPublic: doc.isPublic,
        collaborators,
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePermission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: documentId, permissionId } = req.params;
      const { role } = req.body;

      const permission = await prisma.documentPermission.update({
        where: { id: permissionId, documentId },
        data: { role },
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      });

      sendSuccess(res, { permission });
    } catch (error) {
      next(error);
    }
  }

  async revokePermission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: documentId, permissionId } = req.params;

      await prisma.documentPermission.delete({
        where: { id: permissionId, documentId },
      });

      sendSuccess(res, { message: 'Collaborator access revoked successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const permissionsController = new PermissionsController();

