import { LeaveIncidentRoomUseCase } from '../../use-cases/leave-incident-room.use-case';

describe('LeaveIncidentRoomUseCase (unit)', () => {
  const access = {
    authorizeById: jest.fn().mockResolvedValue({ incident: { id: 'INC1' }, role: 'CITIZEN' }),
  } as any;
  const ids = { make: jest.fn().mockReturnValue({ identity: 'citizen:U1' }) } as any;
  const events = { voiceLeft: jest.fn().mockResolvedValue(undefined) } as any;

  beforeEach(() => jest.clearAllMocks());

  it('authorizes by incidentId, builds identity and logs VOICE_LEFT', async () => {
    const sut = new LeaveIncidentRoomUseCase(access, ids, events);

    const out = await sut.execute({ sub: 'U1', roles: ['CITIZEN'] }, { incidentId: 'INC1', name: 'Vítima' });

    expect(access.authorizeById).toHaveBeenCalledWith({ sub: 'U1', roles: ['CITIZEN'] }, 'INC1');
    expect(ids.make).toHaveBeenCalledWith('CITIZEN', 'U1', 'Vítima');
    expect(events.voiceLeft).toHaveBeenCalledWith('INC1', 'citizen:U1', 'CITIZEN');
    expect(out).toEqual({ ok: true });
  });
});

