import { JoinIncidentRoomUseCase } from "../../use-cases/join-incident-room.use-case";

describe('JoinIncidentRoomUseCase (unit)', () => {
  const prisma = {
    incident: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    incidentEvent: { create: jest.fn() },
  } as any;

  const lk = {
    mintToken: jest.fn().mockResolvedValue('test.jwt'),
    getUrl: () => 'wss://example.livekit.cloud',
  } as any;

  beforeEach(() => jest.clearAllMocks());

  it('gera roomName, atualiza audioRoomId e retorna token', async () => {
    const incident = { id: 'INCID', code: 'INC-ABCDEF', audioRoomId: null };
    prisma.incident.findUnique.mockResolvedValue(incident);

    const sut = new JoinIncidentRoomUseCase(prisma as any, lk as any);
    const out = await sut.execute({
      incidentId: 'INCID',
      participantType: 'DISPATCHER',
      participantId: 'user-1',
      mode: 'PTT',
      name: 'Operador',
    });

    expect(prisma.incident.update).toHaveBeenCalledWith({
      where: { id: 'INCID' },
      data: { audioRoomId: 'inc_INC-ABCDEF' },
    });
    expect(lk.mintToken).toHaveBeenCalled();
    expect(out.token).toBe('test.jwt');
    expect(out.roomName).toBe('inc_INC-ABCDEF');
    expect(out.identity).toContain('user:');
  });
});
