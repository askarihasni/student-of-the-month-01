import fs from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import PDFDocument from 'pdfkit';
import { ExportStatus } from '@prisma/client';
import { prisma } from '../../database/prisma.js';
import { NotFoundError, BadRequestError } from '../../shared/errors/app-error.js';
import { CreateExportInput } from './exports.schema.js';

const EXPORTS_DIR = process.cwd().endsWith('server')
  ? path.resolve(process.cwd(), 'uploads', 'exports')
  : path.resolve(process.cwd(), 'server', 'uploads', 'exports');

export class ExportsService {
  async createExportJob(documentId: string, userId: string, input: CreateExportInput) {
    const doc = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!doc || doc.isDeleted) {
      throw new NotFoundError('Document not found');
    }

    const job = await prisma.exportJob.create({
      data: {
        documentId,
        format: input.format,
        status: ExportStatus.PROCESSING,
        createdById: userId,
      },
    });

    // Execute generation
    this.processExport(job.id, doc.data as any, input).catch(async (err) => {
      await prisma.exportJob.update({
        where: { id: job.id },
        data: {
          status: ExportStatus.FAILED,
          error: err.message || 'Export generation failed',
        },
      });
    });

    return job;
  }

  async getExportJob(jobId: string) {
    const job = await prisma.exportJob.findUnique({
      where: { id: jobId },
      include: {
        document: { select: { id: true, name: true } },
      },
    });

    if (!job) {
      throw new NotFoundError('Export job not found');
    }

    return job;
  }

  private async processExport(jobId: string, docData: any, input: CreateExportInput): Promise<void> {
    const activePageId = input.pageId || docData.activePageId || docData.pages?.[0]?.id;
    const page = docData.pages?.find((p: any) => p.id === activePageId) || docData.pages?.[0];

    if (!page) {
      throw new BadRequestError('Document has no valid pages to export');
    }

    const fileId = randomUUID();

    if (input.format === 'json') {
      const filename = `${fileId}.json`;
      const filePath = path.join(EXPORTS_DIR, filename);
      await fs.writeFile(filePath, JSON.stringify(docData, null, 2), 'utf-8');

      await prisma.exportJob.update({
        where: { id: jobId },
        data: {
          status: ExportStatus.COMPLETED,
          filePath,
          fileUrl: `/uploads/exports/${filename}`,
        },
      });
      return;
    }

    if (input.format === 'svg') {
      const svgContent = this.generateSvg(page);
      const filename = `${fileId}.svg`;
      const filePath = path.join(EXPORTS_DIR, filename);
      await fs.writeFile(filePath, svgContent, 'utf-8');

      await prisma.exportJob.update({
        where: { id: jobId },
        data: {
          status: ExportStatus.COMPLETED,
          filePath,
          fileUrl: `/uploads/exports/${filename}`,
        },
      });
      return;
    }

    if (input.format === 'pdf') {
      const filename = `${fileId}.pdf`;
      const filePath = path.join(EXPORTS_DIR, filename);

      await this.generatePdf(page, filePath);

      await prisma.exportJob.update({
        where: { id: jobId },
        data: {
          status: ExportStatus.COMPLETED,
          filePath,
          fileUrl: `/uploads/exports/${filename}`,
        },
      });
      return;
    }

    // Default to SVG representation for png placeholder
    const svgFallback = this.generateSvg(page);
    const filename = `${fileId}.svg`;
    const filePath = path.join(EXPORTS_DIR, filename);
    await fs.writeFile(filePath, svgFallback, 'utf-8');

    await prisma.exportJob.update({
      where: { id: jobId },
      data: {
        status: ExportStatus.COMPLETED,
        filePath,
        fileUrl: `/uploads/exports/${filename}`,
      },
    });
  }

  private generateSvg(page: any): string {
    const nodes = page.nodes || {};
    let minX = 0;
    let minY = 0;
    let maxX = 1200;
    let maxY = 800;

    const nodeEntries = Object.values(nodes) as any[];
    if (nodeEntries.length > 0) {
      minX = Math.min(...nodeEntries.map((n) => n.x || 0));
      minY = Math.min(...nodeEntries.map((n) => n.y || 0));
      maxX = Math.max(...nodeEntries.map((n) => (n.x || 0) + (n.width || 100)));
      maxY = Math.max(...nodeEntries.map((n) => (n.y || 0) + (n.height || 100)));
    }

    const width = Math.max(200, maxX - minX + 80);
    const height = Math.max(200, maxY - minY + 80);
    const viewBox = `${minX - 40} ${minY - 40} ${width} ${height}`;

    let elements = '';
    for (const node of nodeEntries) {
      if (node.visible === false) continue;

      const fill = node.style?.fill || 'none';
      const stroke = node.style?.stroke || 'none';
      const strokeWidth = node.style?.strokeWidth || 0;
      const opacity = node.opacity ?? 1;
      const rx = node.style?.cornerRadius || 0;

      if (node.type === 'rectangle' || node.type === 'frame') {
        elements += `  <rect x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}" />\n`;
      } else if (node.type === 'ellipse') {
        const cx = node.x + node.width / 2;
        const cy = node.y + node.height / 2;
        const rxVal = node.width / 2;
        const ryVal = node.height / 2;
        elements += `  <ellipse cx="${cx}" cy="${cy}" rx="${rxVal}" ry="${ryVal}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}" />\n`;
      } else if (node.type === 'line') {
        const x2 = node.x2 ?? node.x + node.width;
        const y2 = node.y2 ?? node.y + node.height;
        elements += `  <line x1="${node.x}" y1="${node.y}" x2="${x2}" y2="${y2}" stroke="${stroke !== 'none' ? stroke : fill}" stroke-width="${strokeWidth || 2}" opacity="${opacity}" />\n`;
      } else if (node.type === 'text') {
        const fontSize = node.fontSize || 16;
        const fontFamily = node.fontFamily || 'sans-serif';
        const textFill = node.style?.fill || '#000000';
        elements += `  <text x="${node.x}" y="${node.y + fontSize}" font-family="${fontFamily}" font-size="${fontSize}" fill="${textFill}" opacity="${opacity}">${this.escapeXml(node.text || '')}</text>\n`;
      } else if (node.type === 'pen' && node.points && node.points.length > 0) {
        const d = node.points
          .map((pt: any, i: number) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`)
          .join(' ');
        elements += `  <path d="${d}" fill="${fill}" stroke="${stroke !== 'none' ? stroke : '#ffffff'}" stroke-width="${strokeWidth || 2}" opacity="${opacity}" />\n`;
      }
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${width}" height="${height}">
  <rect width="100%" height="100%" fill="#090a0f"/>
${elements}</svg>`;
  }

  private generatePdf(page: any, targetPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 40 });
        const stream = createWriteStream(targetPath);
        doc.pipe(stream);

        doc.fontSize(20).text(`Vectorly Document Export: ${page.name || 'Page 1'}`, { align: 'left' });
        doc.moveDown();

        const nodes = Object.values(page.nodes || {}) as any[];
        for (const node of nodes) {
          if (node.visible === false) continue;

          if (node.type === 'text') {
            doc.fontSize(node.fontSize || 14).text(node.text || '', node.x, node.y);
          } else if (node.type === 'rectangle' || node.type === 'frame') {
            doc.rect(node.x, node.y, node.width, node.height).stroke();
          } else if (node.type === 'ellipse') {
            const cx = node.x + node.width / 2;
            const cy = node.y + node.height / 2;
            doc.ellipse(cx, cy, node.width / 2, node.height / 2).stroke();
          }
        }

        doc.end();
        stream.on('finish', () => resolve());
        stream.on('error', (err) => reject(err));
      } catch (err) {
        reject(err);
      }
    });
  }

  private escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  }
}

export const exportsService = new ExportsService();
