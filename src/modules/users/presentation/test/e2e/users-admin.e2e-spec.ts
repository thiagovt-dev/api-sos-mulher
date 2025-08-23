import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { AppModule } from '@/app.module';

const prisma = new PrismaClient();

describe('E2E: Admin -> Citizens', () => {
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

  it('ADMIN cria cidadão e lista', async () => {
    const server = app.getHttpServer();

    // cria ADMIN e loga por email/senha
    const passHash = await bcrypt.hash('admin123', 10);
    await prisma.user.create({ data: { username: 'admin_users', email: 'admin_users@example.com', passwordHash: passHash, roles: { set: ['ADMIN'] } } });
    const login = await request(server)
      .post('/api/auth/login')
      .send({ email: 'admin_users@example.com', password: 'admin123' })
      .expect(200);
    const token = login.body.access_token as string;

    // cria citizen
    const email = `cit-${Date.now()}@sos.com`;
    await request(server)
      .post('/api/admin/citizens')
      .set('Authorization', `Bearer ${token}`)
      .send({ email, password: 'secret123', phone: '+55 11 99999-0000', roles: ['CITIZEN'] })
      .expect(201);

    // lista citizens
    const list = await request(server)
      .get('/api/admin/citizens')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(list.body.some((u: any) => u.email === email)).toBe(true);
  });

  it('ADMIN lista todos os usuários', async () => {
    const server = app.getHttpServer();

    // cria ADMIN e loga por email/senha
    const passHash = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        username: 'admin_users_all',
        email: 'admin_all@example.com',
        passwordHash: passHash,
        roles: { set: ['ADMIN'] },
      },
    });
    const login = await request(server)
      .post('/api/auth/login')
      .send({ email: 'admin_all@example.com', password: 'admin123' })
      .expect(200);
    const token = login.body.access_token as string;

    // cria citizen para compor a lista
    const email = `cit-${Date.now()}@sos.com`;
    await request(server)
      .post('/api/admin/citizens')
      .set('Authorization', `Bearer ${token}`)
      .send({ email, password: 'secret123', phone: '+55 11 99999-0000', roles: ['CITIZEN'] })
      .expect(201);

    // lista todos usuários
    const all = await request(server)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const emails = all.body.map((u: any) => u.email);
    expect(emails).toEqual(expect.arrayContaining(['admin_all@example.com', email]));
  });
});
