import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { AppModule } from '@/app.module';

const prisma = new PrismaClient();

async function createAdminAndLogin(app: INestApplication) {
  const passwordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: { username: 'admin_units', email: 'admin_units@example.com', passwordHash, roles: { set: ['ADMIN'] } },
  });
  const login = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({ email: 'admin_units@example.com', password: 'admin123' })
    .expect(200);
  return { token: login.body.access_token as string, admin };
}

describe('E2E: Units', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const modRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = modRef.createNestApplication();
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

  it('ADMIN cria unit, atualiza e reseta PIN; POLICE atualiza token', async () => {
    const server = app.getHttpServer();
    const { token: adminToken } = await createAdminAndLogin(app);

    // ADMIN cria unit com credenciais
    const created = await request(server)
      .post('/api/units')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'GCM 10', plate: 'GCM-10', username: 'gcm10', pin: '555555' })
      .expect(201);
    const unitId = created.body.unitId ?? created.body.id ?? created.body?.unit?.id ?? created.body?.unitId;

    // ADMIN atualiza unit
    await request(server)
      .patch(`/api/units/${unitId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'GCM 10A', plate: 'GCM-10A', active: true })
      .expect(200);

    // ADMIN reseta PIN
    const reset = await request(server)
      .post(`/api/units/${unitId}/reset-pin`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(201);
    expect(reset.body).toHaveProperty('pin');

    // POLICE login
    const policeLogin = await request(server)
      .post('/api/auth/police/login')
      .send({ login: 'gcm10', pin: reset.body.pin })
      .expect(201);
    const policeToken = policeLogin.body.access_token as string;

    // POLICE atualiza token FCM
    await request(server)
      .patch(`/api/units/${unitId}/token`)
      .set('Authorization', `Bearer ${policeToken}`)
      .send({ token: 'fcm_police_10' })
      .expect(200);
  });
});

