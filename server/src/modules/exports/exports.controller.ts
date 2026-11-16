import { Request, Response, NextFunction } from 'express';
import { exportsService } from './exports.service.js';
import { sendSuccess } from '../../shared/schemas/api-response.js';
import { NotFoundError } from '../../shared/errors/app-error.js';
import fs from 'node:fs';

export class ExportsController {
  async createExport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const documentId = req.params.id;
      const userId = req.user!.id;

      const job = await exportsService.createExportJob(documentId, userId, req.body);
      sendSuccess(res, { job }, 202);
    } catch (error) {
      next(error);
    }
  }

  async getExportStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { jobId } = req.params;
      const job = await exportsService.getExportJob(jobId);
      sendSuccess(res, { job });
    } catch (error) {
      next(error);
    }
  }

  async downloadExport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { jobId } = req.params;
      const job = await exportsService.getExportJob(jobId);

      if (!job.filePath || !fs.existsSync(job.filePath)) {
        throw new NotFoundError('Exported file not available or expired');
      }

      res.download(job.filePath, `${job.document?.name || 'vectorly-export'}.${job.format}`);
    } catch (error) {
      next(error);
    }
  }
}

export const exportsController = new ExportsController();

