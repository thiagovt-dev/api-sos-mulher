import { ListCitizenUsersUseCase } from '../../use-cases/list-citizen-users.use-case';

describe('ListCitizenUsersUseCase (unit)', () => {
  const prisma = {
    user: {
      findMany: jest.fn().mockResolvedValue([
        { id: 'u3', email: 'c@s.com', createdAt: new Date('2024-01-03') },
      ]),
    },
  } as any;

  beforeEach(() => jest.clearAllMocks());

  it('filtra por CITIZEN e retorna campos básicos', async () => {
    const sut = new ListCitizenUsersUseCase(prisma);
    const out = await sut.execute();

    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: { roles: { has: 'CITIZEN' } },
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, createdAt: true },
    });
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ id: 'u3', email: 'c@s.com' });
  });
});

