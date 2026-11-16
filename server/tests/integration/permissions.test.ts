import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { Role } from '@prisma/client';

describe('Document RBAC & Permissions Integration Tests', () => {
  let ownerToken = '';
  let collaboratorToken = '';
  let collaboratorEmail = '';
  let docId = '';
  let docData: any;
  let permissionId = '';

  beforeAll(async () => {
    // 1. Register owner
    const ownerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Doc Owner',
        email: `owner_${Date.now()}@vectorly.io`,
        password: 'Password123!',
      });
    ownerToken = ownerRes.body.data.accessToken;

    // 2. Register collaborator
    collaboratorEmail = `collab_${Date.now()}@vectorly.io`;
    const collabRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Collaborator User',
        email: collaboratorEmail,
        password: 'Password123!',
      });
    collaboratorToken = collabRes.body.data.accessToken;

    // 3. Create document by owner
    const docRes = await request(app)
      .post('/api/documents')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        name: 'RBAC Team Canvas',
        template: 'blank',
      });
    docId = docRes.body.data.document.id;
    docData = docRes.body.data.document.data;
  });

  it('Owner invites collaborator as VIEWER', async () => {
    const res = await request(app)
      .post(`/api/documents/${docId}/permissions`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        email: collaboratorEmail,
        role: Role.VIEWER,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.permission.role).toBe(Role.VIEWER);
    permissionId = res.body.data.permission.id;
  });

  it('VIEWER can read document', async () => {
    const res = await request(app)
      .get(`/api/documents/${docId}`)
      .set('Authorization', `Bearer ${collaboratorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.document.userRole).toBe(Role.VIEWER);
  });

  it('VIEWER cannot sync/edit document (403 Forbidden)', async () => {
    const res = await request(app)
      .patch(`/api/documents/${docId}/sync`)
      .set('Authorization', `Bearer ${collaboratorToken}`)
      .send({
        expectedVersion: 1,
        data: docData,
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('Owner promotes collaborator to EDITOR', async () => {
    const res = await request(app)
      .patch(`/api/documents/${docId}/permissions/${permissionId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        role: Role.EDITOR,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.permission.role).toBe(Role.EDITOR);
  });

  it('EDITOR can sync/edit document', async () => {
    const res = await request(app)
      .patch(`/api/documents/${docId}/sync`)
      .set('Authorization', `Bearer ${collaboratorToken}`)
      .send({
        expectedVersion: 1,
        data: docData,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.version).toBe(2);
  });

  it('Owner revokes collaborator permission', async () => {
    const res = await request(app)
      .delete(`/api/documents/${docId}/permissions/${permissionId}`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Collaborator should no longer have access
    const checkRes = await request(app)
      .get(`/api/documents/${docId}`)
      .set('Authorization', `Bearer ${collaboratorToken}`);
    expect(checkRes.status).toBe(403);
  });
});
