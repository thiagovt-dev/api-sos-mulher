import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { AppModule } from '@/app.module';

const prisma = new PrismaClient();

describe('E2E: Voice module', () => {
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

  it('Citizen joins voice room and admin closes it', async () => {
    const server = app.getHttpServer();

    // Citizen registers and logs in
    const email = `v-${Date.now()}@sos.com`;
    await request(server).post('/api/auth/register').send({ email, password: 'secret123' }).expect(201);
    const login = await request(server).post('/api/auth/login').send({ email, password: 'secret123' }).expect(200);
    const citizenToken = login.body.access_token as string;

    // Create incident as citizen
    const inc = await request(server)
      .post('/api/incidents')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({ lat: -23.55, lng: -46.63, description: 'voice e2e' })
      .expect(201);
    const incidentId = inc.body.id as string;

    // Join voice as citizen
    const join = await request(server)
      .post('/api/voice/join')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({ incidentId, mode: 'LISTEN', name: 'Vítima' })
      .expect(201);
    expect(join.body).toEqual(
      expect.objectContaining({ url: expect.any(String), roomName: expect.any(String), token: expect.any(String), identity: expect.any(String), mode: 'LISTEN' }),
    );

    // Create admin and login
    const adminPassHash = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: { username: 'admin_voice', email: 'admin_voice@example.com', passwordHash: adminPassHash, roles: { set: ['ADMIN'] } },
    });
    const adminLogin = await request(server)
      .post('/api/auth/login')
      .send({ email: 'admin_voice@example.com', password: 'admin123' })
      .expect(200);
    const adminToken = adminLogin.body.access_token as string;

    // Close room as admin
    const close = await request(server)
      .post('/api/voice/close')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ incidentId })
      .expect(201);
    expect(close.body).toEqual({ ok: true });

    // Check events
    const events = await prisma.incidentEvent.findMany({ where: { incidentId } });
    expect(events.some((e) => e.type === 'VOICE_JOINED')).toBe(true);
    expect(events.some((e) => e.type === 'VOICE_ROOM_CLOSED')).toBe(true);
  });
});
