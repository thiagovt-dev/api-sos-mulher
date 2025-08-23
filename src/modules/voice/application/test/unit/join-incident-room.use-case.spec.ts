import { JoinIncidentRoomUseCase } from '../../use-cases/join-incident-room.use-case';

describe('JoinIncidentRoomUseCase (unit)', () => {
  const prisma = {
    incident: { findUnique: jest.fn() },
  } as any;

  const lk = {
    mintToken: jest.fn().mockResolvedValue('test.jwt'),
    getUrl: () => 'wss://example.livekit.cloud',
  } as any;

  const access = { authorize: jest.fn().mockResolvedValue({ role: 'ADMIN', defaultMode: 'FULL' }) } as any;
  const rooms = { ensureRoom: jest.fn().mockResolvedValue('inc_INC-ABCDEF') } as any;
  const ids = { make: jest.fn().mockReturnValue({ identity: 'admin:U1', displayName: 'Operator' }) } as any;
  const events = { voiceJoined: jest.fn().mockResolvedValue(undefined) } as any;

  beforeEach(() => jest.clearAllMocks());

  it('autoriza acesso, garante sala, emite evento e retorna token', async () => {
    prisma.incident.findUnique.mockResolvedValue({ id: 'INCID', code: 'INC-ABCDEF', status: 'OPEN' });

    const sut = new JoinIncidentRoomUseCase(prisma as any, lk as any, access, rooms, ids, events);
    const out = await sut.execute({ sub: 'U1', roles: ['ADMIN'] }, { incidentId: 'INCID', mode: 'FULL', name: 'Op' });

    expect(access.authorize).toHaveBeenCalled();
    expect(rooms.ensureRoom).toHaveBeenCalled();
    expect(ids.make).toHaveBeenCalledWith('ADMIN', 'U1', 'Op');
    expect(lk.mintToken).toHaveBeenCalled();
    expect(events.voiceJoined).toHaveBeenCalled();
    expect(out).toEqual(
      expect.objectContaining({ url: expect.any(String), roomName: 'inc_INC-ABCDEF', token: 'test.jwt', identity: 'admin:U1', mode: 'FULL' }),
    );
  });
});
