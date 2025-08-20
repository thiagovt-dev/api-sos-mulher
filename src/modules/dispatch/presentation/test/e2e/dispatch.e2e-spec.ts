import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { AppModule } from '@/app.module';
import { PUSH_QUEUE } from '@/infra/queue/tokens';
import { FcmService } from '@/shared/notifications/fcm.service';
import { RedlockService } from '@/shared/locks/redlock.service';


const prisma = new PrismaClient();

// fila fake que apenas registra jobs em memória
function makeFakeQueue() {
  const jobs: any[] = [];
  return {
    add: async (name: string, data: any) => {
      jobs.push({ name, data });
    },
    __jobs: jobs,
  };
}

describe('E2E: Unit -> Incident -> Dispatch', () => {
  let app: INestApplication;
  const fakeQueue = makeFakeQueue();
  let token: string;

  beforeAll(async () => {
    const modRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PUSH_QUEUE)
      .useValue(fakeQueue)
      .overrideProvider(FcmService)
      .useValue({ safeSendToToken: jest.fn() })
      .overrideProvider(RedlockService)
      .useValue({
        withLock: async (_k: string, _ttl: number, fn: any) => fn(),
      })
      .compile();

    app = modRef.createNestApplication();
    app.setGlobalPrefix('api'); // espelha teu main.ts
    await app.init();
  });

  beforeEach(async () => {
    // limpa DB entre testes
    await prisma.$executeRawUnsafe(`
      TRUNCATE TABLE "Dispatch","IncidentEvent","Incident","Unit"
      RESTART IDENTITY CASCADE;
    `);
    // limpa jobs simulados
    (fakeQueue.__jobs as any[]).length = 0;
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('cria Unit, Incident, faz Dispatch e atualiza status', async () => {
    // 1) Unit
    const server = app.getHttpServer();

    // auth
    const email = `flow-${Date.now()}@sos.com`;
    await request(server).post('/api/auth/register').send({ email, name: 'Flow', password: 'secret123' }).expect(201);
    const login = await request(server).post('/api/auth/login').send({ email, password: 'secret123' }).expect(200);
    token = login.body.access_token;

    const uRes = await request(server)
      .post('/api/units')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'GCM 01', plate: 'GCM-01', fcmToken: 'TESTE_PUSH' })
      .expect(201);
    const unitId = uRes.body.id;

    // 2) Incident
    const iRes = await request(server)
      .post('/api/incidents')
      .set('Authorization', `Bearer ${token}`)
      .send({ lat: -19.938, lng: -43.938, address: 'Rua X, 123', description: 'Sinal discreto' })
      .expect(201);
    const incidentId = iRes.body.id;

    // 3) Dispatch
    const dRes = await request(server)
      .post('/api/dispatch')
      .set('Authorization', `Bearer ${token}`)
      .send({ incidentId, unitId })
      .expect(201);
    expect(dRes.body.status).toBe('PENDING');

    // 4) Incidente atualizado
    const list = await request(server)
      .get('/api/incidents')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    const inc = list.body.find((x: any) => x.id === incidentId);
    expect(inc.status).toBe('IN_DISPATCH');
    expect(inc.dispatches?.length).toBe(1);

    // 5) Job de push enfileirado (mock)
    const jobs = fakeQueue.__jobs as any[];
    expect(jobs.length).toBe(1);
    expect(jobs[0].name).toBe('notify-dispatch');
    expect(jobs[0].data.token).toBe('TESTE_PUSH');

    // 6) Evento registrado
    const events = await prisma.incidentEvent.findMany({ where: { incidentId } });
    expect(events.some((e) => e.type === 'DISPATCH_CREATED')).toBe(true);
  });
});
