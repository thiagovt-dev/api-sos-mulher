import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { AppModule } from '@/app.module';

const prisma = new PrismaClient();

describe('E2E: Me (citizen profile)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const mod = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = mod.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
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

  it('CITIZEN atualiza e obtém seu profile', async () => {
    const server = app.getHttpServer();

    // registra cidadão via fluxo normal
    const email = `me-${Date.now()}@sos.com`;
    await request(server).post('/api/auth/register').send({ email, password: 'secret123' }).expect(201);
    const login = await request(server).post('/api/auth/login').send({ email, password: 'secret123' }).expect(200);
    const token = login.body.access_token as string;

    // atualiza profile
    await request(server)
      .put('/api/me/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ phone: '+55 11 90000-0000', city: 'São Paulo', state: 'SP', lat: -23.5, lng: -46.6 })
      .expect(200);

    // obtém profile
    const get = await request(server)
      .get('/api/me/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(get.body).toMatchObject({ phone: '+55 11 90000-0000', city: 'São Paulo', state: 'SP' });
  });
});

