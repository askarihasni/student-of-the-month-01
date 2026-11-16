import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { randomUUID } from 'node:crypto';

describe('Authentication Integration Tests', () => {
  const uniqueEmail = `testuser_${Date.now()}_${randomUUID().substring(0, 5)}@vectorly.io`;
  const validPassword = 'StrongPassword123!';
  let accessToken = '';
  let refreshToken = '';

  it('POST /api/auth/register creates user and starter documents', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Designer',
        email: uniqueEmail,
        password: validPassword,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(uniqueEmail.toLowerCase());
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    expect(res.headers['set-cookie']).toBeDefined();

    accessToken = res.body.data.accessToken;
    refreshToken = res.body.data.refreshToken;
  });

  it('POST /api/auth/register fails with duplicate email (409 Conflict)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Duplicate Designer',
        email: uniqueEmail,
        password: validPassword,
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('POST /api/auth/register fails with weak password (422)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Weak Password',
        email: `weak_${Date.now()}@vectorly.io`,
        password: 'weak',
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/login succeeds with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: uniqueEmail,
        password: validPassword,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.name).toBe('Test Designer');
  });

  it('POST /api/auth/login fails with invalid password (401)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: uniqueEmail,
        password: 'WrongPassword123!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/auth/me returns authenticated user profile', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(uniqueEmail.toLowerCase());
  });

  it('GET /api/auth/me fails without authorization header (401)', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/refresh rotates tokens', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    expect(res.body.data.refreshToken).not.toBe(refreshToken); // Token rotated!

    // Using the old refresh token must now fail
    const reuseRes = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken });
    expect(reuseRes.status).toBe(401);
  });
});

