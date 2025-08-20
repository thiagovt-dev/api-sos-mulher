import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { AppModule } from '@/app.module';

const prisma = new PrismaClient();

describe('E2E: Incidents', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    const modRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = modRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  beforeEach(async () => {
    await prisma.$executeRawUnsafe(`
      TRUNCATE TABLE "Dispatch","IncidentEvent","Incident","Unit"
      RESTART IDENTITY CASCADE;
    `);
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('POST /api/incidents cria incidente e lista em /api/incidents', async () => {
    const server = app.getHttpServer();

    // auth
    const email = `inc-${Date.now()}@sos.com`;
    await request(server).post('/api/auth/register').send({ email, name: 'Inc', password: 'secret123' }).expect(201);
    const login = await request(server).post('/api/auth/login').send({ email, password: 'secret123' }).expect(200);
    token = login.body.access_token;

    const payload = {
      lat: -19.938001,
      lng: -43.938001,
      address: 'Rua X, 123',
      description: 'Sinal discreto',
    };

    // cria incidente
    const res = await request(server)
      .post('/api/incidents')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('code');
    expect(res.body.status).toBe('OPEN');
    expect(Number(res.body.lat)).toBeCloseTo(payload.lat, 5);
    expect(Number(res.body.lng)).toBeCloseTo(payload.lng, 5);
    expect(res.body.address).toBe(payload.address);
    expect(res.body.description).toBe(payload.description);

    const incidentId = res.body.id as string;

    // lista deve conter o incidente
    const list = await request(server)
      .get('/api/incidents')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    const found = list.body.find((x: any) => x.id === incidentId);
    expect(found).toBeTruthy();
    expect(found.status).toBe('OPEN');

    // evento CREATED registrado
    const events = await prisma.incidentEvent.findMany({ where: { incidentId } });
    expect(events.some((e) => e.type === 'CREATED')).toBe(true);
  });
});
