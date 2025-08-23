import { UnauthorizedException } from '@nestjs/common';
import { PoliceLoginUseCase } from '../../use-cases/police-login.use-case';

jest.mock('bcryptjs', () => ({ compare: jest.fn() }));
import * as bcrypt from 'bcryptjs';

describe('PoliceLoginUseCase (unit)', () => {
  const prisma = {
    user: { findFirst: jest.fn() },
  } as any;
  const jwt = { signAsync: jest.fn().mockResolvedValue('jwt123') } as any;

  beforeEach(() => jest.clearAllMocks());

  it('autentica policial por username normalizado e PIN', async () => {
    prisma.user.findFirst.mockResolvedValue({ id: 'U1', passwordHash: '$hash', roles: ['POLICE'] });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const sut = new PoliceLoginUseCase(prisma, jwt);
    const out = await sut.execute({ login: ' GCM-01 ', pin: '654321' });

    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: { username: 'gcm01', roles: { has: 'POLICE' } },
    });
    expect(out).toEqual({ access_token: 'jwt123' });
  });

  it('falha quando PIN inválido', async () => {
    prisma.user.findFirst.mockResolvedValue({ id: 'U1', passwordHash: '$hash', roles: ['POLICE'] });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    const sut = new PoliceLoginUseCase(prisma, jwt);
    await expect(sut.execute({ login: 'gcm01', pin: 'x' })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('falha quando usuário não encontrado', async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    const sut = new PoliceLoginUseCase(prisma, jwt);
    await expect(sut.execute({ login: 'gcm01', pin: 'x' })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});

