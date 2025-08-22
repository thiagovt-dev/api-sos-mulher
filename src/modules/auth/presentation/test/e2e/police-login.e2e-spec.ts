import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { AppModule } from '@/app.module';

const prisma = new PrismaClient();

describe('E2E: Auth police login', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const mod = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = mod.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  beforeEach(async () => {
    await prisma.$executeRawUnsafe(`
      TRUNCATE TABLE "Dispatch","IncidentEvent","Incident","Unit","User" RESTART IDENTITY CASCADE;
    `);
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('login via username + pin (POLICE)', async () => {
    // cria User(POLICE) + Unit 1:1
    const pinHash = await bcrypt.hash('654321', 10);
    const user = await prisma.user.create({
      data: {
        email: 'gcm01@example.com',
        username: 'gcm01',
        passwordHash: pinHash,
        roles: { set: ['POLICE'] },
      },
    });
    await prisma.unit.create({ data: { id: user.id, name: 'GCM 01', plate: 'GCM-01', active: true } });

    const server = app.getHttpServer();
    const res = await request(server)
      .post('/api/auth/police/login')
      .send({ login: 'gcm01', pin: '654321' })
      .expect(201);
    expect(res.body.access_token).toBeDefined();
  });
});
