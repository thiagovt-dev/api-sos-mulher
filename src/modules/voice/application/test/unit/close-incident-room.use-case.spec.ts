import { CloseIncidentRoomUseCase } from '../../use-cases/close-incident-room.use-case';
import { BadRequestException } from '@nestjs/common';

describe('CloseIncidentRoomUseCase (unit)', () => {
  const prisma = {
    incident: { findUnique: jest.fn(), update: jest.fn() },
    incidentEvent: { create: jest.fn() },
  } as any;

  beforeEach(() => jest.clearAllMocks());

  it('fecha sala e registra evento quando incidente existe', async () => {
    prisma.incident.findUnique.mockResolvedValue({ id: 'INC1', audioRoomId: 'inc_X' });
    const sut = new CloseIncidentRoomUseCase(prisma);
    const out = await sut.execute({ incidentId: 'INC1' });
    expect(prisma.incident.update).toHaveBeenCalledWith({ where: { id: 'INC1' }, data: { audioRoomId: null } });
    expect(prisma.incidentEvent.create).toHaveBeenCalled();
    expect(out).toEqual({ ok: true });
  });

  it('lança erro quando incidente não existe', async () => {
    prisma.incident.findUnique.mockResolvedValue(null);
    const sut = new CloseIncidentRoomUseCase(prisma);
    await expect(sut.execute({ incidentId: 'NA' })).rejects.toBeInstanceOf(BadRequestException);
  });
});

