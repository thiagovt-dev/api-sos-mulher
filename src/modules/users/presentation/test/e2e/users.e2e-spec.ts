import request from 'supertest';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { PrismaClient } from '@prisma/client';
import { createTestApp } from '../../../../../../test/utils/test-app';

describe('Users (e2e)', () => {
  let app: NestFastifyApplication;
  const prisma = new PrismaClient();

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    app = await createTestApp();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('POST /api/users -> 201 e GET por id -> 200', async () => {
    const server = app.getHttpServer();

    const payload = {
      email: `dev-${Date.now()}@sos.com`,
      name: 'Dev Tester',
      password: 'secret123',
    };

    const res = await request(server)
      .post('/api/users')
      .send(payload)
      .expect(201);
    const id = res.body.id as string;

    const resGet = await request(server).get(`/api/users/${id}`).expect(200);
    expect(resGet.body).toMatchObject({
      id,
      email: payload.email,
      name: payload.name,
    });
  });

  it('POST e-mail duplicado -> 400', async () => {
    const server = app.getHttpServer();
    const email = `dup-${Date.now()}@sos.com`;

    await request(server)
      .post('/api/users')
      .send({ email, name: 'Jhon Doe', password: 'secret123' }) 
      .expect(201);

    const res = await request(server)
      .post('/api/users')
      .send({ email, name: 'BB', password: 'secret123' })
      .expect(400);

    expect(res.body.message).toMatch(/E-mail já cadastrado/i);
  });
});
