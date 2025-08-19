import request from 'supertest';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { createTestApp } from '../../../../../test/utils/test-app';

describe('Health (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/health -> 200', async () => {
    const server = app.getHttpServer();
    const res = await request(server).get('/api/health').expect(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
