import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../database/prisma.js';
import { sendSuccess } from '../../shared/schemas/api-response.js';
import { NotFoundError } from '../../shared/errors/app-error.js';

export class VersionsController {
  async createVersion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const documentId = req.params.id;
      const userId = req.user!.id;
      const { name } = req.body;

      const doc = await prisma.document.findUnique({
        where: { id: documentId },
        select: { version: true, data: true },
      });

      if (!doc) {
        throw new NotFoundError('Document not found');
      }

      const version = await prisma.documentVersion.create({
        data: {
          documentId,
          versionNumber: doc.version,
          name,
          snapshot: doc.data as any,
          createdById: userId,
        },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      });

      sendSuccess(res, { version }, 201);
    } catch (error) {
      next(error);
    }
  }

  async listVersions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const documentId = req.params.id;

      const versions = await prisma.documentVersion.findMany({
        where: { documentId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          versionNumber: true,
          name: true,
          createdAt: true,
          createdBy: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      });

      sendSuccess(res, { versions });
    } catch (error) {
      next(error);
    }
  }

  async getVersion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: documentId, versionId } = req.params;

      const version = await prisma.documentVersion.findFirst({
        where: { id: versionId, documentId },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      });

      if (!version) {
        throw new NotFoundError('Version snapshot not found');
      }

      sendSuccess(res, { version });
    } catch (error) {
      next(error);
    }
  }

  async restoreVersion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: documentId, versionId } = req.params;
      const userId = req.user!.id;

      const snapshot = await prisma.documentVersion.findFirst({
        where: { id: versionId, documentId },
      });

      if (!snapshot) {
        throw new NotFoundError('Version snapshot not found');
      }

      const restored = await prisma.$transaction(async (tx) => {
        const current = await tx.document.findUnique({
          where: { id: documentId },
          select: { version: true },
        });

        if (!current) {
          throw new NotFoundError('Document not found');
        }

        const nextVersion = current.version + 1;
        const restoredData = {
          ...(snapshot.snapshot as any),
          id: documentId,
          version: nextVersion,
          updatedAt: new Date().toISOString(),
        };

        const updated = await tx.document.update({
          where: { id: documentId },
          data: {
            data: restoredData as any,
            version: nextVersion,
          },
        });

        // Record a restore milestone
        await tx.documentVersion.create({
          data: {
            documentId,
            versionNumber: nextVersion,
            name: `Restored from ${snapshot.name || `v${snapshot.versionNumber}`}`,
            snapshot: restoredData as any,
            createdById: userId,
          },
        });

        return updated;
      });

      sendSuccess(res, {
        message: 'Version restored successfully',
        document: restored,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const versionsController = new VersionsController();
