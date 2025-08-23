import request from 'supertest';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { PrismaClient } from '@prisma/client';
import { createTestApp } from '../../../../../../test/utils/test-app';

describe('E2E: Location ping', () => {
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

  it('POST /api/location/ping com JWT → 201 {id}', async () => {
    const server = app.getHttpServer();

    // register + login
    const email = `loc-${Date.now()}@sos.com`;
    const password = 'secret123';

    const reg = await request(server)
      .post('/api/auth/register')
      .send({ email, password })
      .expect(201);

    const login = await request(server)
      .post('/api/auth/login')
      .send({ email, password })
      .expect(200);
    const token = login.body.access_token as string;

    // call ping
    const body = { lat: -23.55052, lng: -46.633308, accuracy: 10 };
    const res = await request(server)
      .post('/api/location/ping')
      .set('Authorization', `Bearer ${token}`)
      .send(body)
      .expect(201);

    expect(res.body).toHaveProperty('id');

    // verify persisted
    const userId = reg.body.id as string;
    const saved = await prisma.locationSample.findFirst({ where: { userId } });
    expect(saved).toBeTruthy();
    // compara numericamente com 6 casas
    expect(Number(saved!.lat)).toBeCloseTo(-23.55052, 6);
    expect(Number(saved!.lng)).toBeCloseTo(-46.633308, 6);
  });
});
