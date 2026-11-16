import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { randomUUID } from 'node:crypto';

describe('Documents API Integration Tests', () => {
  let token = '';
  let createdDocId = '';

  beforeAll(async () => {
    const email = `docuser_${Date.now()}@vectorly.io`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Doc Tester',
        email,
        password: 'Password123!',
      });
    token = res.body.data.accessToken;
  });

  it('POST /api/documents creates a new document with blank template', async () => {
    const res = await request(app)
      .post('/api/documents')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'My Custom Wireframe',
        template: 'blank',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.document.id).toBeDefined();
    expect(res.body.data.document.name).toBe('My Custom Wireframe');
    expect(res.body.data.document.userRole).toBe('OWNER');

    createdDocId = res.body.data.document.id;
  });

  it('POST /api/documents creates a mobile app template document', async () => {
    const res = await request(app)
      .post('/api/documents')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'iOS Wallet Screen',
        template: 'mobile-app',
      });

    expect(res.status).toBe(201);
    const docData = res.body.data.document.data;
    expect(docData.pages[0].nodes['screen_frame']).toBeDefined();
    expect(docData.pages[0].nodes['screen_frame'].type).toBe('frame');
  });

  it('GET /api/documents lists user documents with pagination', async () => {
    const res = await request(app)
      .get('/api/documents?page=1&limit=10')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.documents)).toBe(true);
    expect(res.body.data.documents.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.pagination.page).toBe(1);
  });

  it('GET /api/documents/:id returns full document and user role', async () => {
    const res = await request(app)
      .get(`/api/documents/${createdDocId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.document.id).toBe(createdDocId);
    expect(res.body.data.document.userRole).toBe('OWNER');
    expect(res.body.data.document.data.pages).toBeDefined();
  });

  it('PATCH /api/documents/:id updates document name', async () => {
    const res = await request(app)
      .patch(`/api/documents/${createdDocId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Renamed Wireframe v2',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.document.name).toBe('Renamed Wireframe v2');
  });

  it('POST /api/documents/:id/duplicate duplicates the document', async () => {
    const res = await request(app)
      .post(`/api/documents/${createdDocId}/duplicate`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.document.id).not.toBe(createdDocId);
    expect(res.body.data.document.name).toContain('Copy');
  });

  it('DELETE /api/documents/:id soft-deletes the document', async () => {
    const res = await request(app)
      .delete(`/api/documents/${createdDocId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Fetching again should return 404
    const getRes = await request(app)
      .get(`/api/documents/${createdDocId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(getRes.status).toBe(404);
  });
});
