import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { AppModule } from '@/app.module';

const prisma = new PrismaClient();

describe('E2E: Incidents', () => {
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
    await request(server).post('/api/auth/register').send({ email, password: 'secret123' }).expect(201);
    const login = await request(server)
      .post('/api/auth/login')
      .send({ email, password: 'secret123' })
      .expect(200);
    const token = login.body.access_token as string;

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

    // evento CREATED registrado (mantém tua asserção existente)
    const events = await prisma.incidentEvent.findMany({ where: { incidentId } });
    expect(events.some((e) => e.type === 'CREATED')).toBe(true);
  });

  it('POST /api/incidents/:id/close fecha incidente como RESOLVED e registra STATUS_CHANGED', async () => {
    const server = app.getHttpServer();

    // auth próprio deste teste
    const email = `close-${Date.now()}@sos.com`;
    await request(server).post('/api/auth/register').send({ email, password: 'secret123' }).expect(201);
    const login = await request(server)
      .post('/api/auth/login')
      .send({ email, password: 'secret123' })
      .expect(200);
    const token = login.body.access_token as string;

    // cria incidente
    const inc = await request(server)
      .post('/api/incidents')
      .set('Authorization', `Bearer ${token}`)
      .send({ lat: -1, lng: -1, description: 'fechar e2e' })
      .expect(201);
    const incidentId = inc.body.id as string;

    // fecha (padrão RESOLVED)
    const closed = await request(server)
      .post(`/api/incidents/${incidentId}/close`)
      .set('Authorization', `Bearer ${token}`)
      .send({ reason: 'teste e2e' })
      .expect(201);

    expect(closed.body.ok).toBe(true);
    expect(closed.body.status).toBe('RESOLVED');

    // confere no banco
    const dbInc = await prisma.incident.findUnique({ where: { id: incidentId } });
    expect(dbInc?.status).toBe('RESOLVED');

    // evento STATUS_CHANGED
    const evs = await prisma.incidentEvent.findMany({ where: { incidentId } });
    const statusChanged = evs.find((e) => e.type === 'STATUS_CHANGED');
    expect(statusChanged).toBeTruthy();
    // se você armazena payload JSON com "to" e "reason", checa rapidamente:
    // @ts-expect-error (payload é JSON)
    expect(statusChanged?.payload?.to).toBe('RESOLVED');
  });

  it('POST /api/dispatch/:id/accept aceita dispatch e registra eventos', async () => {
    const server = app.getHttpServer();

    // auth próprio deste teste
    const email = `accept-${Date.now()}@sos.com`;
    await request(server).post('/api/auth/register').send({ email, password: 'secret123' }).expect(201);
    const login = await request(server)
      .post('/api/auth/login')
      .send({ email, password: 'secret123' })
      .expect(200);
    const token = login.body.access_token as string;

    // cria Unit direto no banco (evita depender de guard da rota /units)
    const uUser = await prisma.user.create({ data: { username: 'u1', roles: { set: ['POLICE'] } } });
    const unit = await prisma.unit.create({ data: { id: uUser.id, name: 'U1', plate: `GCM-${Date.now()}`, active: true } });

    // cria incidente
    const inc = await request(server)
      .post('/api/incidents')
      .set('Authorization', `Bearer ${token}`)
      .send({ lat: -2, lng: -2 })
      .expect(201);
    const incidentId = inc.body.id as string;

    // cria dispatch
    const disp = await request(server)
      .post('/api/dispatch')
      .set('Authorization', `Bearer ${token}`)
      .send({ incidentId, unitId: unit.id })
      .expect(201);
    const dispatchId = disp.body.id as string;

    // aceita dispatch
    const accepted = await request(server)
      .post(`/api/dispatch/${dispatchId}/accept`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    expect(accepted.body.ok).toBe(true);
    expect(accepted.body.status).toBe('ACCEPTED');

    // eventos esperados: DISPATCH_CREATED e UNIT_ACCEPTED
    const evs = await prisma.incidentEvent.findMany({ where: { incidentId } });
    expect(evs.some((e) => e.type === 'DISPATCH_CREATED')).toBe(true);
    expect(evs.some((e) => e.type === 'UNIT_ACCEPTED')).toBe(true);

    // incidente deve permanecer IN_DISPATCH após o accept
    const fresh = await prisma.incident.findUnique({ where: { id: incidentId } });
    expect(fresh?.status).toBe('IN_DISPATCH');
  });
});
