import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../database/prisma.js';
import { sendSuccess } from '../../shared/schemas/api-response.js';

export class UsersController {
  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { name, avatarUrl } = req.body;

      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(name ? { name } : {}),
          ...(avatarUrl !== undefined ? { avatarUrl } : {}),
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          updatedAt: true,
        },
      });

      sendSuccess(res, { user: updated });
    } catch (error) {
      next(error);
    }
  }

  async searchUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const q = (req.query.q as string) || '';
      const currentUserId = req.user?.id;

      const users = await prisma.user.findMany({
        where: {
          AND: [
            currentUserId ? { id: { not: currentUserId } } : {},
            {
              OR: [
                { email: { contains: q, mode: 'insensitive' } },
                { name: { contains: q, mode: 'insensitive' } },
              ],
            },
          ],
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
        },
        take: 10,
      });

      sendSuccess(res, { users });
    } catch (error) {
      next(error);
    }
  }
}

export const usersController = new UsersController();

