import { BadRequestException } from '@nestjs/common';
import { AcceptDispatchUseCase } from '../../use-cases/accept-dispatch.use-case';

function makePrisma() {
  const prisma: any = {
    dispatch: { findUnique: jest.fn(), update: jest.fn() },
    incident: { findUnique: jest.fn(), update: jest.fn() },
    incidentEvent: { create: jest.fn() },
    $transaction: jest.fn().mockImplementation(async (_ops: any[]) => {
      // simulate returning [updatedDispatch] just like Prisma does
      return [{ id: 'DISP1', status: 'ACCEPTED' }];
    }),
  };
  return prisma;
}

describe('AcceptDispatchUseCase (unit)', () => {
  const gateway = { emitUpdated: jest.fn() } as any;

  beforeEach(() => jest.clearAllMocks());

  it('aceita dispatch PENDING e emite atualização', async () => {
    const prisma = makePrisma();
    prisma.dispatch.findUnique.mockResolvedValue({
      id: 'DISP1',
      incidentId: 'INC1',
      unitId: 'UNIT1',
      status: 'PENDING',
    });
    prisma.incident.findUnique.mockResolvedValue({ id: 'INC1', dispatches: [] });

    const sut = new AcceptDispatchUseCase(prisma as any, gateway);
    const out = await sut.execute({ dispatchId: 'DISP1' });

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(gateway.emitUpdated).toHaveBeenCalledWith({ id: 'INC1', dispatches: [] });
    expect(out).toEqual({ ok: true, dispatchId: 'DISP1', status: 'ACCEPTED' });
  });

  it('aceita dispatch NOTIFIED também', async () => {
    const prisma = makePrisma();
    prisma.dispatch.findUnique.mockResolvedValue({
      id: 'DISP2',
      incidentId: 'INC2',
      unitId: 'UNIT2',
      status: 'NOTIFIED',
    });
    prisma.incident.findUnique.mockResolvedValue({ id: 'INC2', dispatches: [] });

    const sut = new AcceptDispatchUseCase(prisma as any, gateway);
    const out = await sut.execute({ dispatchId: 'DISP2' });
    expect(out.status).toBe('ACCEPTED');
  });

  it('recusa quando dispatch não encontrado', async () => {
    const prisma = makePrisma();
    prisma.dispatch.findUnique.mockResolvedValue(null);

    const sut = new AcceptDispatchUseCase(prisma as any, gateway);
    await expect(sut.execute({ dispatchId: 'NA' })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('recusa quando status não permite aceitar', async () => {
    const prisma = makePrisma();
    prisma.dispatch.findUnique.mockResolvedValue({ id: 'D3', incidentId: 'I3', unitId: 'U3', status: 'ACCEPTED' });

    const sut = new AcceptDispatchUseCase(prisma as any, gateway);
    await expect(sut.execute({ dispatchId: 'D3' })).rejects.toBeInstanceOf(BadRequestException);
  });
});

