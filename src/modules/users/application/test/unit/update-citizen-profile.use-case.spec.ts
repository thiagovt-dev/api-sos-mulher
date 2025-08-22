import { UpdateMyCitizenProfileUseCase } from '../../use-cases/update-citizen-profile.use-case';

describe('UpdateMyCitizenProfileUseCase (unit)', () => {
  const prisma = {
    citizenProfile: {
      upsert: jest.fn().mockResolvedValue({ userId: 'U1', phone: '+55', city: 'SP' }),
    },
  } as any;

  beforeEach(() => jest.clearAllMocks());

  it('exige phone e lança erro quando ausente', async () => {
    const sut = new UpdateMyCitizenProfileUseCase(prisma);
    await expect(sut.execute('U1', { phone: '' } as any)).rejects.toBeInstanceOf(Error);
  });

  it('upsert profile com lat/lng convertidos para string', async () => {
    const sut = new UpdateMyCitizenProfileUseCase(prisma);
    const out = await sut.execute('U1', { phone: '+55', lat: -1.1, lng: -2.2 } as any);
    expect(prisma.citizenProfile.upsert).toHaveBeenCalled();
    expect(out).toEqual({ userId: 'U1', phone: '+55', city: 'SP' });
  });
});

