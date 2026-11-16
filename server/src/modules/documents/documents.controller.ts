import { Request, Response, NextFunction } from 'express';
import { documentsService } from './documents.service.js';
import { sendSuccess } from '../../shared/schemas/api-response.js';
import { Role } from '@prisma/client';

export class DocumentsController {
  async createDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { name, template } = req.body;

      const document = await documentsService.createDocument(userId, name, template);
      sendSuccess(res, { document }, 201);
    } catch (error) {
      next(error);
    }
  }

  async listDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await documentsService.listDocuments(userId, req.query as any);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getDocumentById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const documentId = req.params.id;
      const userId = req.user?.id;

      const document = await documentsService.getDocumentById(documentId, userId);
      sendSuccess(res, { document });
    } catch (error) {
      next(error);
    }
  }

  async updateMetadata(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const documentId = req.params.id;
      const { name, isPublic } = req.body;

      const document = await documentsService.updateDocumentMetadata(documentId, name, isPublic);
      sendSuccess(res, { document });
    } catch (error) {
      next(error);
    }
  }

  async deleteDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const documentId = req.params.id;
      await documentsService.softDeleteDocument(documentId);
      sendSuccess(res, { message: 'Document deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async duplicateDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const documentId = req.params.id;
      const userId = req.user!.id;

      const duplicated = await documentsService.duplicateDocument(documentId, userId);
      sendSuccess(res, { document: duplicated }, 201);
    } catch (error) {
      next(error);
    }
  }

  async syncDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const documentId = req.params.id;
      const userId = req.user?.id;
      const { expectedVersion, data, thumbnailUrl, nodeCount } = req.body;

      const updated = await documentsService.syncDocument(
        documentId,
        expectedVersion,
        data,
        userId,
        thumbnailUrl,
        nodeCount
      );

      sendSuccess(res, {
        documentId: updated.id,
        version: updated.version,
        updatedAt: updated.updatedAt,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const documentsController = new DocumentsController();

