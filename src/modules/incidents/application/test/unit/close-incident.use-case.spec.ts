import { IncidentRepository } from '@/modules/incidents/domain/repositories/incident.repository';
import { BadRequestException } from '@nestjs/common';
import { Incident } from '@prisma/client';
import { CloseIncidentUseCase } from '../../use-cases/close-incident.use-case';


function makeRepo() {
  return {
    findById: jest.fn(),
    closeIncident: jest.fn(),
  } as unknown as jest.Mocked<IncidentRepository>;
}

function makeIncident(partial: Partial<Incident> = {}): Incident {
  return {
    id: 'INC1',
    code: 'INC-TEST',
    lat: 0,
    lng: 0,
    address: null,
    description: null,
    status: 'OPEN',
    citizenId: null,
    audioRoomId: null,
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
    closedAt: null,
    closedById: null,
    closedReason: null,
    ...partial,
  } as Incident;
}

describe('CloseIncidentUseCase (unit)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fecha incidente como RESOLVED por padrão', async () => {
    const repo = makeRepo();
    const current = makeIncident({ id: 'INC1', status: 'OPEN' });
    const updated = makeIncident({
      id: 'INC1',
      status: 'RESOLVED',
      closedAt: new Date(),
      closedById: 'user-1',
    });

    (repo.findById as jest.Mock).mockResolvedValueOnce(current);
    (repo.closeIncident as jest.Mock).mockResolvedValueOnce(updated);

    const sut = new CloseIncidentUseCase(repo);
    const out = await sut.execute({ incidentId: 'INC1', closedById: 'user-1' });

    expect(repo.findById).toHaveBeenCalledWith('INC1');
    expect(repo.closeIncident).toHaveBeenCalledWith({
      incidentId: 'INC1',
      newStatus: 'RESOLVED',
      closedById: 'user-1',
      closedReason: undefined,
    });
    expect(out.status).toBe('RESOLVED');
  });

  it('fecha incidente como CANCELED com razão', async () => {
    const repo = makeRepo();
    const current = makeIncident({ id: 'INC2', status: 'OPEN' });
    const updated = makeIncident({
      id: 'INC2',
      status: 'CANCELED',
      closedAt: new Date(),
      closedById: 'user-2',
      closedReason: 'reported false alarm',
    });

    (repo.findById as jest.Mock).mockResolvedValueOnce(current);
    (repo.closeIncident as jest.Mock).mockResolvedValueOnce(updated);

    const sut = new CloseIncidentUseCase(repo);
    const out = await sut.execute({
      incidentId: 'INC2',
      as: 'CANCELED',
      reason: 'reported false alarm',
      closedById: 'user-2',
    });

    expect(repo.closeIncident).toHaveBeenCalledWith({
      incidentId: 'INC2',
      newStatus: 'CANCELED',
      closedById: 'user-2',
      closedReason: 'reported false alarm',
    });
    expect(out.status).toBe('CANCELED');
    expect(out.closedReason).toBe('reported false alarm');
  });

  it('rejeita quando incidente não existe', async () => {
    const repo = makeRepo();
    (repo.findById as jest.Mock).mockResolvedValueOnce(null);

    const sut = new CloseIncidentUseCase(repo);
    await expect(sut.execute({ incidentId: 'NA', closedById: 'user-x' })).rejects.toBeInstanceOf(
      BadRequestException,
    );

    expect(repo.closeIncident).not.toHaveBeenCalled();
  });

  it('rejeita quando incidente já está fechado', async () => {
    const repo = makeRepo();
    (repo.findById as jest.Mock).mockResolvedValueOnce(
      makeIncident({ id: 'INC3', status: 'RESOLVED' }),
    );

    const sut = new CloseIncidentUseCase(repo);
    await expect(sut.execute({ incidentId: 'INC3', closedById: 'user-y' })).rejects.toBeInstanceOf(
      BadRequestException,
    );

    expect(repo.closeIncident).not.toHaveBeenCalled();
  });
});
