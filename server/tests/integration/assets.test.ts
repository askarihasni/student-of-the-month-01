import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import fs from 'node:fs/promises';
import path from 'node:path';

describe('Assets & SVG Sanitization Integration Tests', () => {
  let token = '';
  let docId = '';
  let assetId = '';
  let uploadedSvgFilename = '';

  beforeAll(async () => {
    const email = `assetuser_${Date.now()}@vectorly.io`;
    const authRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Asset Tester',
        email,
        password: 'Password123!',
      });
    token = authRes.body.data.accessToken;

    const docRes = await request(app)
      .post('/api/documents')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Asset Test Document',
        template: 'blank',
      });
    docId = docRes.body.data.document.id;
  });

  it('POST /api/documents/:id/assets uploads an SVG and sanitizes malicious scripts', async () => {
    const maliciousSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="40" fill="red"/>
      <script>alert("XSS Attack");</script>
      <a href="javascript:alert('xss')">Click Me</a>
    </svg>`;

    const res = await request(app)
      .post(`/api/documents/${docId}/assets`)
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from(maliciousSvg, 'utf-8'), 'malicious.svg');

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.asset.id).toBeDefined();
    expect(res.body.data.asset.url).toContain('/uploads/');

    assetId = res.body.data.asset.id;
    uploadedSvgFilename = res.body.data.asset.filename;

    // Verify disk content was sanitized: NO <script> and NO javascript:
    const uploadsDir = process.cwd().endsWith('server')
      ? path.resolve(process.cwd(), 'uploads')
      : path.resolve(process.cwd(), 'server', 'uploads');
    const filePath = path.join(uploadsDir, uploadedSvgFilename);
    const diskContent = await fs.readFile(filePath, 'utf-8');
    expect(diskContent).not.toContain('<script');
    expect(diskContent).not.toContain('alert(');
    expect(diskContent).toContain('<circle');
  });

  it('GET /api/documents/:id/assets lists document assets', async () => {
    const res = await request(app)
      .get(`/api/documents/${docId}/assets`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.assets)).toBe(true);
    expect(res.body.data.assets.length).toBeGreaterThanOrEqual(1);
  });

  it('DELETE /api/documents/:id/assets/:assetId removes asset from DB and disk', async () => {
    const res = await request(app)
      .delete(`/api/documents/${docId}/assets/${assetId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
