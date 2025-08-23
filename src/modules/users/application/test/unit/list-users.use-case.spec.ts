import { ListAllUsersUseCase } from '../../use-cases/list-all-users.use-case';

describe('ListAllUsersUseCase (unit)', () => {
  const prisma = {
    user: {
      findMany: jest.fn().mockResolvedValue([
        { id: 'u2', email: 'b@s.com', createdAt: new Date('2024-01-02') },
        { id: 'u1', email: 'a@s.com', createdAt: new Date('2024-01-01') },
      ]),
    },
  } as any;

  beforeEach(() => jest.clearAllMocks());

  it('retorna lista ordenada por createdAt desc com campos básicos', async () => {
    const sut = new ListAllUsersUseCase(prisma);
    const out = await sut.execute();

    expect(prisma.user.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, createdAt: true },
    });
    expect(out).toHaveLength(2);
    expect(out[0]).toMatchObject({ id: 'u2', email: 'b@s.com' });
  });
});

