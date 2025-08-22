import request from 'supertest';
import { createTestApp } from './utils/test-app';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { PrismaClient } from '@prisma/client';

describe('API e2e (Fastify + /api prefix)', () => {
  let app: NestFastifyApplication;
  const prisma = new PrismaClient();

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await prisma.$executeRawUnsafe(`
      TRUNCATE TABLE "Dispatch","IncidentEvent","Incident","Device","CitizenProfile","Unit","User"
      RESTART IDENTITY CASCADE;
    `);
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('GET /api/health → 200 {status:"ok"}', async () => {
    const server = app.getHttpServer();
    const res = await request(server).get('/api/health').expect(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('POST /api/auth/register e GET /api/users/:id com JWT', async () => {
    const server = app.getHttpServer();

    const payload = {
      email: `dev-${Date.now()}@sos.com`,
      password: 'secret123',
    };

    const res = await request(server)
      .post('/api/auth/register')
      .send(payload)
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body).toMatchObject({ email: payload.email });
    expect(res.body).not.toHaveProperty('password');
    expect(res.body).not.toHaveProperty('passwordHash');

    // login para obter token
    const login = await request(server)
      .post('/api/auth/login')
      .send({ email: payload.email, password: payload.password })
      .expect(200);
    const token = login.body.access_token as string;

    const id = res.body.id as string;
    const resGet = await request(server)
      .get(`/api/users/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(resGet.body).toMatchObject({ id, email: payload.email });
  });

  it('POST /api/users com e-mail duplicado → 400', async () => {
    const server = app.getHttpServer();

    const email = `dup-${Date.now()}@sos.com`;
    await request(server)
      .post('/api/auth/register')
      .send({ email, password: 'secret123' })
      .expect(201);

    const res = await request(server)
      .post('/api/auth/register')
      .send({ email, password: 'secret123' })
      .expect(400);

    expect(res.body.message).toMatch(/E-mail já cadastrado/i);
  });
});
