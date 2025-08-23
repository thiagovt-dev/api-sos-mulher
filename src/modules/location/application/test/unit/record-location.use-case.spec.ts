import { RecordLocationUseCase } from '../../use-cases/record-location.use-case';
import { GeoPoint } from '../../../domain/location.domain';

describe('RecordLocationUseCase (unit)', () => {
  const repo = {
    create: jest.fn().mockResolvedValue({ id: 'LOC1' }),
  } as any;

  beforeEach(() => jest.clearAllMocks());

  it('registra localização de CITIZEN (sem unitId)', async () => {
    const sut = new RecordLocationUseCase(repo);

    const out = await sut.execute({
      userId: 'USER1',
      roles: ['CITIZEN'],
      lat: -23.5,
      lng: -46.6,
      accuracy: 5,
    });

    expect(repo.create).toHaveBeenCalledTimes(1);
    expect(out).toEqual({ id: 'LOC1' });
    const arg = (repo.create as jest.Mock).mock.calls[0][0];
    expect(arg.userId).toBe('USER1');
    expect(arg.unitId).toBeUndefined(); // CITIZEN não gera unitId
    expect(arg.lat).toBeCloseTo(-23.5, 5);
    expect(arg.lng).toBeCloseTo(-46.6, 5);
    expect(arg.source).toBe('MOBILE'); // default
    expect(arg.recordedAt).toBeInstanceOf(Date); // default
  });

  it('registra localização de POLICE (unitId = userId)', async () => {
    const sut = new RecordLocationUseCase(repo);

    await sut.execute({
      userId: 'POL1',
      roles: ['POLICE'],
      lat: 10,
      lng: 20,
      source: 'WEB',
      recordedAt: new Date('2020-01-01T00:00:00.000Z'),
    });

    const arg = (repo.create as jest.Mock).mock.calls[0][0];
    expect(arg.unitId).toBe('POL1');
    expect(arg.source).toBe('WEB');
    expect(arg.recordedAt.toISOString()).toBe('2020-01-01T00:00:00.000Z');
  });

  it('falha para coordenadas inválidas', async () => {
    const sut = new RecordLocationUseCase(repo);

    await expect(
      sut.execute({ userId: 'X', roles: [], lat: -999, lng: 0 }),
    ).rejects.toThrow('lat out of range');

    await expect(
      sut.execute({ userId: 'X', roles: [], lat: 0, lng: 999 }),
    ).rejects.toThrow('lng out of range');
  });
});

