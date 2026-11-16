import fs from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '../../database/prisma.js';
import { sanitizeSvg } from '../../shared/utils/sanitizer.js';
import { NotFoundError, BadRequestError } from '../../shared/errors/app-error.js';

const UPLOADS_DIR = process.cwd().endsWith('server')
  ? path.resolve(process.cwd(), 'uploads')
  : path.resolve(process.cwd(), 'server', 'uploads');

export class AssetsService {
  async saveAsset(
    documentId: string,
    file: Express.Multer.File,
    width?: number,
    height?: number
  ) {
    let finalBuffer = file.buffer;

    // Sanitize SVG if uploaded
    if (file.mimetype === 'image/svg+xml') {
      const rawSvg = file.buffer.toString('utf-8');
      const cleanSvg = sanitizeSvg(rawSvg);
      finalBuffer = Buffer.from(cleanSvg, 'utf-8');
    }

    // Ensure uploads directory exists
    await fs.mkdir(UPLOADS_DIR, { recursive: true });

    // Save to disk
    const extension = path.extname(file.originalname).toLowerCase() || '.bin';
    const filename = `${file.filename || Date.now()}${extension.startsWith('.') ? '' : '.'}${extension}`;
    const filePath = path.join(UPLOADS_DIR, filename);

    await fs.writeFile(filePath, finalBuffer);

    const assetUrl = `/uploads/${filename}`;

    const asset = await prisma.asset.create({
      data: {
        documentId,
        filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: finalBuffer.length,
        url: assetUrl,
        width: width || null,
        height: height || null,
      },
    });

    return asset;
  }

  async listAssets(documentId: string) {
    return await prisma.asset.findMany({
      where: { documentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteAsset(documentId: string, assetId: string) {
    const asset = await prisma.asset.findFirst({
      where: { id: assetId, documentId },
    });

    if (!asset) {
      throw new NotFoundError('Asset not found');
    }

    // Delete from disk
    const filePath = path.join(UPLOADS_DIR, asset.filename);
    try {
      await fs.unlink(filePath);
    } catch {
      // Ignore if file doesn't exist on disk
    }

    // Delete from DB
    await prisma.asset.delete({
      where: { id: assetId },
    });

    return { message: 'Asset deleted successfully' };
  }
}

export const assetsService = new AssetsService();
