import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../database/prisma.js';
import { sendSuccess } from '../../shared/schemas/api-response.js';
import { NotFoundError, ForbiddenError } from '../../shared/errors/app-error.js';
import { Role } from '@prisma/client';

export class CommentsController {
  async createComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const documentId = req.params.id;
      const authorId = req.user!.id;
      const { pageId, x, y, content } = req.body;

      const comment = await prisma.documentComment.create({
        data: {
          documentId,
          pageId,
          x,
          y,
          content,
          authorId,
        },
        include: {
          author: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
          replies: true,
        },
      });

      sendSuccess(res, { comment }, 201);
    } catch (error) {
      next(error);
    }
  }

  async listComments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const documentId = req.params.id;
      const pageId = req.query.pageId as string | undefined;

      const where: any = {
        documentId,
        parentId: null, // Only fetch root comments
      };

      if (pageId) {
        where.pageId = pageId;
      }

      const comments = await prisma.documentComment.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        include: {
          author: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
          replies: {
            orderBy: { createdAt: 'asc' },
            include: {
              author: {
                select: { id: true, name: true, email: true, avatarUrl: true },
              },
            },
          },
        },
      });

      sendSuccess(res, { comments });
    } catch (error) {
      next(error);
    }
  }

  async replyComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: documentId, commentId } = req.params;
      const authorId = req.user!.id;
      const { content } = req.body;

      const parentComment = await prisma.documentComment.findFirst({
        where: { id: commentId, documentId },
      });

      if (!parentComment) {
        throw new NotFoundError('Parent comment thread not found');
      }

      const reply = await prisma.documentComment.create({
        data: {
          documentId,
          pageId: parentComment.pageId,
          x: parentComment.x,
          y: parentComment.y,
          content,
          authorId,
          parentId: commentId,
        },
        include: {
          author: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      });

      sendSuccess(res, { reply }, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: documentId, commentId } = req.params;
      const userId = req.user!.id;
      const userRole = req.documentRole;
      const { content, resolved } = req.body;

      const existing = await prisma.documentComment.findFirst({
        where: { id: commentId, documentId },
      });

      if (!existing) {
        throw new NotFoundError('Comment not found');
      }

      // Only author or owner/editor can edit/resolve
      if (content && existing.authorId !== userId) {
        throw new ForbiddenError('You can only edit your own comments');
      }

      const updated = await prisma.documentComment.update({
        where: { id: commentId },
        data: {
          ...(content ? { content } : {}),
          ...(resolved !== undefined ? { resolved } : {}),
        },
        include: {
          author: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
          replies: {
            include: {
              author: {
                select: { id: true, name: true, email: true, avatarUrl: true },
              },
            },
          },
        },
      });

      sendSuccess(res, { comment: updated });
    } catch (error) {
      next(error);
    }
  }

  async deleteComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: documentId, commentId } = req.params;
      const userId = req.user!.id;
      const userRole = req.documentRole;

      const existing = await prisma.documentComment.findFirst({
        where: { id: commentId, documentId },
      });

      if (!existing) {
        throw new NotFoundError('Comment not found');
      }

      if (existing.authorId !== userId && userRole !== Role.OWNER) {
        throw new ForbiddenError('You can only delete your own comments');
      }

      await prisma.documentComment.delete({
        where: { id: commentId },
      });

      sendSuccess(res, { message: 'Comment deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const commentsController = new CommentsController();

