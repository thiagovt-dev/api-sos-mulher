import { AuthService } from '../../auth.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

import * as bcrypt from 'bcryptjs';

describe('AuthService (unit)', () => {
  const users = {
    findByEmail: jest.fn(),
  } as any;

  const createUser = {
    execute: jest.fn(),
  } as any;

  const jwt = { signAsync: jest.fn().mockResolvedValue('token123') } as unknown as JwtService;
  const sut = new AuthService(users, jwt, createUser);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('register: delega ao CreateUserUseCase e retorna dados públicos', async () => {
    createUser.execute.mockResolvedValue({ id: 'u1', email: 'd@e.com' });

    const out = await sut.register({ email: 'd@e.com', password: 'senha123' });

    expect(createUser.execute).toHaveBeenCalledWith({
      email: 'd@e.com',
      password: 'senha123',
    });
    expect(out).toEqual({ id: 'u1', email: 'd@e.com' });
  });

  it('register: recusa email duplicado', async () => {
    createUser.execute.mockRejectedValue(new BadRequestException('E-mail já cadastrado'));
    await expect(sut.register({ email: 'ja@existe.com', password: '123456' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('login: retorna token quando credenciais ok', async () => {
    users.findByEmail.mockResolvedValue({ id: 'u1', email: 'd@e.com', passwordHash: '$hash', roles: [] });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const out = await sut.login({ email: 'd@e.com', password: 'senha123' });

    expect(out.access_token).toBe('token123');
    // Roles podem ser incluídos no retorno atual; validamos campos principais
    expect(out.user).toMatchObject({ id: 'u1', email: 'd@e.com' });
  });

  it('login: falha quando senha incorreta', async () => {
    users.findByEmail.mockResolvedValue({ id: 'u1', email: 'd@e.com', passwordHash: '$hash' });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(sut.login({ email: 'd@e.com', password: 'errada' })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('login: falha quando usuário não existe', async () => {
    users.findByEmail.mockResolvedValue(null);
    await expect(sut.login({ email: 'x@x.com', password: '123456' })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
