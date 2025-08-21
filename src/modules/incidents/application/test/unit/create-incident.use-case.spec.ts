import { CreateIncidentUseCase } from '../../use-cases/create-incident.use-case';

describe('CreateIncidentUseCase (unit)', () => {
  it('cria incidente com code INC-* e repassa campos', async () => {
    const repo = {
      create: jest.fn().mockImplementation(async (data) => ({
        id: 'inc-1',
        code: data.code,
        description: data.description ?? null,
        lat: String(data.lat),
        lng: String(data.lng),
        address: data.address ?? null,
        status: 'OPEN',
        audioRoomId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      findById: jest.fn().mockImplementation(async (id) => ({
        id,
        code: 'INC-ABCDEF',
        description: 'Sinal discreto',
        lat: '-19.938',
        lng: '-43.938',
        address: 'Rua X, 123',
        status: 'OPEN',
        audioRoomId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    } as any;

    const gateway = { emitCreated: jest.fn() } as any;

    const sut = new CreateIncidentUseCase(repo, gateway);
    const out = await sut.execute({
      lat: -19.938,
      lng: -43.938,
      address: 'Rua X, 123',
      description: 'Sinal discreto',
    });

    expect(repo.create).toHaveBeenCalled();
    expect(repo.findById).toHaveBeenCalledWith('inc-1');
    expect(out?.code).toMatch(/^INC-[0-9A-F]{6}$/);
    expect(out?.status).toBe('OPEN');
    expect(out?.address).toBe('Rua X, 123');
    expect(gateway.emitCreated).toHaveBeenCalledWith(out);
  });
});
