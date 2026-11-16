import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';
import { sendSuccess } from '../../shared/schemas/api-response.js';
import { env } from '../../config/env.js';

const COOKIE_NAME = 'refreshToken';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip;

      const result = await authService.register(req.body, userAgent, ipAddress);

      res.cookie(COOKIE_NAME, result.refreshToken, COOKIE_OPTIONS);
      sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip;

      const result = await authService.login(req.body, userAgent, ipAddress);

      res.cookie(COOKIE_NAME, result.refreshToken, COOKIE_OPTIONS);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip;
      const refreshToken = req.cookies[COOKIE_NAME] || req.body.refreshToken;

      const result = await authService.refreshTokens(refreshToken, userAgent, ipAddress);

      res.cookie(COOKIE_NAME, result.refreshToken, COOKIE_OPTIONS);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies[COOKIE_NAME] || req.body.refreshToken;
      await authService.logout(refreshToken);

      res.clearCookie(COOKIE_NAME, { path: '/' });
      sendSuccess(res, { message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  async logoutAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      await authService.logoutAll(userId);

      res.clearCookie(COOKIE_NAME, { path: '/' });
      sendSuccess(res, { message: 'All sessions terminated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.getMe(req.user!.id);
      sendSuccess(res, { user });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
