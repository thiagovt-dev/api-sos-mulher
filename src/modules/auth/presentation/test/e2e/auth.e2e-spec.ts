process.env.JWT_SECRET = 'e2e_secret';
process.env.JWT_EXPIRES_IN = '5m';

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { AppModule } from '@/app.module';

const prisma = new PrismaClient();

describe('Auth E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {

    const modRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = modRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  beforeEach(async () => {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "User" RESTART IDENTITY CASCADE;`);
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('register -> login -> acessa rota protegida com Bearer', async () => {
    // register
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ name: 'Disp', email: 'disp@example.com', password: 'senha123' })
      .expect(201);

    // login
    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'disp@example.com', password: 'senha123' })
      .expect(200);

    const token = login.body.access_token;
    expect(token).toBeDefined();

    // protected
    await request(app.getHttpServer())
      .get('/api/auth/protected')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});
