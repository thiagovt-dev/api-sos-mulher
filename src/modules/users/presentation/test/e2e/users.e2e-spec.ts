import request from 'supertest';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { PrismaClient } from '@prisma/client';
import { createTestApp } from '../../../../../../test/utils/test-app';

describe('Users (e2e)', () => {
  let app: NestFastifyApplication;
  const prisma = new PrismaClient();
  let token: string;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    app = await createTestApp();
  });

  beforeEach(async () => {
    await prisma.$executeRawUnsafe(`
      TRUNCATE TABLE "Dispatch","IncidentEvent","Incident","Device","CitizenProfile","Unit","User"
      RESTART IDENTITY CASCADE;
    `);

    const payload = { email: `dev-${Date.now()}@sos.com`, password: 'secret123' };

    const server = app.getHttpServer();
    await request(server).post('/api/auth/register').send(payload).expect(201);
    const login = await request(server).post('/api/auth/login').send({ email: payload.email, password: payload.password }).expect(200);
    const id = login.body.user.id as string;
    token = login.body.access_token;

    // Sanity: GET /users/:id with auth
    await request(server).get(`/api/users/${id}`).set('Authorization', `Bearer ${token}`).expect(200);
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('GET por id -> 200', async () => {
    const server = app.getHttpServer();

    const payload = { email: `dev-${Date.now()}@sos.com`, password: 'secret123' };

    await request(server).post('/api/auth/register').send(payload).expect(201);
    const login = await request(server).post('/api/auth/login').send({ email: payload.email, password: payload.password }).expect(200);
    const id = login.body.user.id as string;

    const resGet = await request(server)
      .get(`/api/users/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(resGet.body).toMatchObject({ id, email: payload.email });
  });

  it('register e-mail duplicado -> 400', async () => {
    const server = app.getHttpServer();
    const email = `dup-${Date.now()}@sos.com`;

    await request(server).post('/api/auth/register').send({ email, password: 'secret123' }).expect(201);

    const res = await request(server)
      .post('/api/auth/register')
      .send({ email, password: 'secret123' })
      .expect(400);
    expect(res.body.message).toMatch(/already in use|E-mail já cadastrado/i);
  });
});
