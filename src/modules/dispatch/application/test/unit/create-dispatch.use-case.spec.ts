import { BadRequestException } from '@nestjs/common';
import { CreateDispatchUseCase } from '../../use-cases/create-dispatch.use-case';

const makePrisma = () =>
  ({
    incident: { findUnique: jest.fn() },
    unit: { findUnique: jest.fn() },
    incidentEvent: { create: jest.fn() },
  }) as any;

// helper para prisma com chaves únicas
function prismaMock() {
  const obj: any = {
    incident: { findUnique: jest.fn() },
    unit: { findUnique: jest.fn() },
    incidentEvent: { create: jest.fn() },
  };
  // alias para reuso
  obj.incident2 = obj.incident;
  return obj;
}

describe('CreateDispatchUseCase (unit)', () => {
  const incidentId = 'INCID';
  const unitId = 'UNIT1';

  const repo = {
    assign: jest.fn().mockResolvedValue({ id: 'DISP1', status: 'PENDING' }),
    markNotified: jest.fn().mockResolvedValue(undefined),
  } as any;

  const lock = {
    withLock: (_k: string, _ttl: number, fn: any) => fn(),
  } as any;

  const gateway = {
    emitUpdated: jest.fn(),
  } as any;

  const pushQueue = {
    add: jest.fn().mockResolvedValue(undefined),
  } as any;

  it('cria dispatch, emite WS e enfileira push se fcmToken existir', async () => {
    const prisma = prismaMock();
    prisma.incident.findUnique.mockResolvedValue({ id: incidentId, code: 'INC-AAAAAA' });
    prisma.unit.findUnique.mockResolvedValue({ id: unitId, active: true, fcmToken: 'TESTE_PUSH' });

    const sut = new CreateDispatchUseCase(repo, lock, prisma, gateway, pushQueue as any);

    // also usado pelo use case pra carregar incidente fresh
    prisma.incident.findUnique.mockResolvedValueOnce({ id: incidentId, dispatches: [] }); // para emitUpdated

    const out = await sut.execute({ incidentId, unitId });

    expect(repo.assign).toHaveBeenCalledWith(incidentId, unitId);
    expect(gateway.emitUpdated).toHaveBeenCalled();
    expect(pushQueue.add).toHaveBeenCalledWith(
      'notify-dispatch',
      expect.objectContaining({
        token: 'TESTE_PUSH',
        data: { type: 'INCIDENT_DISPATCH', incidentId },
      }),
    );
    expect(repo.markNotified).toHaveBeenCalled();
    expect(out.status).toBe('PENDING');
  });

  it('lança erro se incidente não existir', async () => {
    const prisma = prismaMock();
    prisma.incident.findUnique.mockResolvedValue(null);

    const sut = new CreateDispatchUseCase(repo, lock, prisma, gateway, pushQueue as any);
    await expect(sut.execute({ incidentId, unitId })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('lança erro se unit inativa', async () => {
    const prisma = prismaMock();
    prisma.incident.findUnique.mockResolvedValue({ id: incidentId });
    prisma.unit.findUnique.mockResolvedValue({ id: unitId, active: false });

    const sut = new CreateDispatchUseCase(repo, lock, prisma, gateway, pushQueue as any);
    await expect(sut.execute({ incidentId, unitId })).rejects.toBeInstanceOf(BadRequestException);
  });
});
