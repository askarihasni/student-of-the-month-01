import type { Request, Response, NextFunction } from 'express';
import { aiService } from './ai.service.js';
import { sendSuccess } from '../../shared/schemas/api-response.js';

export class AiController {
  async generate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { prompt, targetPosition } = req.body;
      const customApiKey = req.headers['x-gemini-api-key'] as string | undefined;

      const result = await aiService.generateDesign(prompt, targetPosition, customApiKey);

      sendSuccess(res, result, 200, 'Design generated successfully');
    } catch (error) {
      next(error);
    }
  }

  async status(req: Request, res: Response): Promise<void> {
    const hasServerKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5;
    sendSuccess(res, {
      available: true,
      model: 'gemini-2.5-flash / procedural-agent',
      hasServerKey,
    });
  }
}

export const aiController = new AiController();
