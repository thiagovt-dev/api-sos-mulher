import { BadRequestException } from '@nestjs/common';
import { CloseIncidentUseCase } from '../../use-cases/close-incident.use-case';

function makePrisma() {
  const prisma: any = {
    incident: { findUnique: jest.fn(), update: jest.fn() },
    incidentEvent: { create: jest.fn() },
    $transaction: jest.fn().mockResolvedValue(undefined),
  };
  return prisma;
}

describe('CloseIncidentUseCase (unit)', () => {
  const gateway = { emitUpdated: jest.fn() } as any;

  beforeEach(() => jest.clearAllMocks());

  it('fecha incidente como RESOLVED por padrão', async () => {
    const prisma = makePrisma();
    prisma.incident.findUnique
      .mockResolvedValueOnce({ id: 'INC1', status: 'OPEN' }) // load current
      .mockResolvedValueOnce({ id: 'INC1', status: 'RESOLVED', dispatches: [] }); // fresh

    const sut = new CloseIncidentUseCase(prisma as any, gateway);
    const out = await sut.execute({ incidentId: 'INC1' });

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(gateway.emitUpdated).toHaveBeenCalledWith({ id: 'INC1', status: 'RESOLVED', dispatches: [] });
    expect(out).toEqual({ ok: true, incidentId: 'INC1', status: 'RESOLVED' });
  });

  it('fecha incidente como CANCELED com razão', async () => {
    const prisma = makePrisma();
    prisma.incident.findUnique
      .mockResolvedValueOnce({ id: 'INC2', status: 'OPEN' })
      .mockResolvedValueOnce({ id: 'INC2', status: 'CANCELED', dispatches: [] });

    const sut = new CloseIncidentUseCase(prisma as any, gateway);
    const out = await sut.execute({ incidentId: 'INC2', as: 'CANCELED', reason: 'reported false alarm' });

    expect(out.status).toBe('CANCELED');
  });

  it('rejeita quando incidente não existe', async () => {
    const prisma = makePrisma();
    prisma.incident.findUnique.mockResolvedValue(null);

    const sut = new CloseIncidentUseCase(prisma as any, gateway);
    await expect(sut.execute({ incidentId: 'NA' })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejeita quando incidente já está fechado', async () => {
    const prisma = makePrisma();
    prisma.incident.findUnique.mockResolvedValue({ id: 'INC3', status: 'RESOLVED' });

    const sut = new CloseIncidentUseCase(prisma as any, gateway);
    await expect(sut.execute({ incidentId: 'INC3' })).rejects.toBeInstanceOf(BadRequestException);
  });
});

