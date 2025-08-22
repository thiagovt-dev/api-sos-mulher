import { BadRequestException } from '@nestjs/common';
import { AdminCreateCitizenUseCase } from '../../use-cases/admin-create-citizen.use-case';

jest.mock('bcryptjs', () => ({ hash: jest.fn().mockResolvedValue('hashed_pass') }));

describe('AdminCreateCitizenUseCase (unit)', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn().mockResolvedValue({ id: 'U1', email: 'a@b.com' }),
    },
    citizenProfile: { create: jest.fn() },
  } as any;

  beforeEach(() => jest.clearAllMocks());

  it('cria cidadão novo quando email livre', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    const sut = new AdminCreateCitizenUseCase(prisma);
    const out = await sut.execute({ email: 'a@b.com', password: '123456', phone: '+55 11 99999-0000' });
    expect(out).toEqual({ userId: 'U1', email: 'a@b.com' });
    expect(prisma.citizenProfile.create).toHaveBeenCalled();
  });

  it('recusa email duplicado', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'X' });
    const sut = new AdminCreateCitizenUseCase(prisma);
    await expect(sut.execute({ email: 'a@b.com', password: 'x' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});

