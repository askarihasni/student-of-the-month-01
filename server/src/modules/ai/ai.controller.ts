import type { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { aiService } from './ai.service.js';
import { sendSuccess } from '../../shared/schemas/api-response.js';
import { logger } from '../../config/logger.js';

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
      model: 'gemini-2.5-flash / gemini-1.5-flash',
      hasServerKey,
    });
  }

  async setKey(req: Request, res: Response): Promise<void> {
    const { apiKey } = req.body;
    if (typeof apiKey === 'string' && apiKey.trim().length > 5) {
      const trimmed = apiKey.trim();
      process.env.GEMINI_API_KEY = trimmed;

      try {
        const envPath = path.resolve(process.cwd(), '.env');
        let envContent = '';
        if (fs.existsSync(envPath)) {
          envContent = fs.readFileSync(envPath, 'utf-8');
        }
        if (envContent.includes('GEMINI_API_KEY=')) {
          envContent = envContent.replace(/GEMINI_API_KEY=.*(\r?\n|$)/, `GEMINI_API_KEY=${trimmed}$1`);
        } else {
          envContent = `${envContent.trim()}\nGEMINI_API_KEY=${trimmed}\n`;
        }
        fs.writeFileSync(envPath, envContent, 'utf-8');
        logger.info('Saved GEMINI_API_KEY to server .env');
      } catch (err) {
        logger.warn({ err }, 'Failed to persist GEMINI_API_KEY to .env file');
      }

      sendSuccess(res, { success: true, message: 'Gemini API key configured successfully' }, 200);
    } else {
      process.env.GEMINI_API_KEY = '';
      sendSuccess(res, { success: true, message: 'Gemini API key cleared' }, 200);
    }
  }
}

export const aiController = new AiController();

