import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';

describe('Document Optimistic Locking & Sync Integration Tests', () => {
  let token = '';
  let docId = '';
  let initialDocData: any;

  beforeAll(async () => {
    const email = `syncuser_${Date.now()}@vectorly.io`;
    const authRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Sync Tester',
        email,
        password: 'Password123!',
      });
    token = authRes.body.data.accessToken;

    const docRes = await request(app)
      .post('/api/documents')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Sync Test Canvas',
        template: 'blank',
      });
    docId = docRes.body.data.document.id;
    initialDocData = docRes.body.data.document.data;
  });

  it('PATCH /api/documents/:id/sync succeeds with matching expectedVersion', async () => {
    // Add a rectangle to the document
    const updatedData = {
      ...initialDocData,
      pages: [
        {
          ...initialDocData.pages[0],
          rootNodeIds: ['rect_sync_1'],
          nodes: {
            rect_sync_1: {
              id: 'rect_sync_1',
              type: 'rectangle',
              name: 'Synced Rectangle',
              x: 100,
              y: 100,
              width: 200,
              height: 150,
              rotation: 0,
              opacity: 1,
              visible: true,
              locked: false,
              style: {
                fill: '#3b82f6',
              },
            },
          },
        },
      ],
    };

    const res = await request(app)
      .patch(`/api/documents/${docId}/sync`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        expectedVersion: 1,
        data: updatedData,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.version).toBe(2);
    expect(res.body.data.documentId).toBe(docId);
  });

  it('PATCH /api/documents/:id/sync returns 409 Conflict when expectedVersion is stale', async () => {
    const staleData = {
      ...initialDocData,
      name: 'Stale update attempt',
    };

    // Current version on server is 2, but client claims expectedVersion 1
    const res = await request(app)
      .patch(`/api/documents/${docId}/sync`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        expectedVersion: 1,
        data: staleData,
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('CONFLICT');
    expect(res.body.error.details.currentVersion).toBe(2);
  });

  it('PATCH /api/documents/:id/sync advances version from 2 to 3 with correct expectedVersion', async () => {
    const validData = {
      ...initialDocData,
      version: 2,
    };

    const res = await request(app)
      .patch(`/api/documents/${docId}/sync`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        expectedVersion: 2,
        data: validData,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.version).toBe(3);
  });

  it('PATCH /api/documents/:id/sync returns 422 for malformed document data', async () => {
    const invalidData = {
      ...initialDocData,
      pages: 'not-an-array', // Invalid type
    };

    const res = await request(app)
      .patch(`/api/documents/${docId}/sync`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        expectedVersion: 3,
        data: invalidData,
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

