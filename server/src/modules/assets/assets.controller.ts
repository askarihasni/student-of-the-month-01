import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { assetsService } from './assets.service.js';
import { sendSuccess } from '../../shared/schemas/api-response.js';
import { BadRequestError, PayloadTooLargeError } from '../../shared/errors/app-error.js';

const ALLOWED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/octet-stream',
]);

const VALID_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg']);

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype.toLowerCase();

    if (ALLOWED_MIME_TYPES.has(mime) || VALID_EXTENSIONS.has(ext)) {
      if (ext === '.svg') {
        file.mimetype = 'image/svg+xml';
      }
      return cb(null, true);
    }
    cb(new BadRequestError(`Unsupported file type: ${file.mimetype}. Allowed types: PNG, JPEG, WEBP, GIF, SVG.`));
  },
});

export class AssetsController {
  async uploadAsset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const documentId = req.params.id;
      if (!req.file) {
        throw new BadRequestError('No file uploaded');
      }

      const width = req.body.width ? parseInt(req.body.width, 10) : undefined;
      const height = req.body.height ? parseInt(req.body.height, 10) : undefined;

      req.file.filename = randomUUID();

      const asset = await assetsService.saveAsset(documentId, req.file, width, height);
      sendSuccess(res, { asset }, 201);
    } catch (error) {
      if ((error as any).code === 'LIMIT_FILE_SIZE') {
        return next(new PayloadTooLargeError('File size exceeds 10MB maximum limit'));
      }
      next(error);
    }
  }

  async listAssets(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const documentId = req.params.id;
      const assets = await assetsService.listAssets(documentId);
      sendSuccess(res, { assets });
    } catch (error) {
      next(error);
    }
  }

  async deleteAsset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: documentId, assetId } = req.params;
      const result = await assetsService.deleteAsset(documentId, assetId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const assetsController = new AssetsController();
