import { BadRequestException } from '@nestjs/common';
import { AdminCreateUserUseCase } from '../../use-cases/admin-create-user.use-case';
import { PASSWORD_HASHER } from '@/shared/auth/domain/ports/tokens';

describe('AdminCreateUserUseCase (unit)', () => {
  const users = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  } as any;
  const citizens = { create: jest.fn() } as any;
  const hasher = { hash: jest.fn().mockResolvedValue('hashed') };

  beforeEach(() => jest.clearAllMocks());

  function makeSut() {
    const sut = new AdminCreateUserUseCase(users, citizens, hasher as any);
    return sut;
  }

  it('cria ADMIN com email e password', async () => {
    users.findByEmail.mockResolvedValue(null);
    users.create.mockResolvedValue({ id: 'U1', email: 'adm@sos.com', roles: ['ADMIN'] });

    const sut = makeSut();
    const out = await sut.execute({ email: 'adm@sos.com', password: '123456', roles: ['ADMIN'] });

    expect(hasher.hash).toHaveBeenCalledWith('123456');
    expect(users.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'adm@sos.com', roles: ['ADMIN'] }),
    );
    expect(out).toEqual({ userId: 'U1', email: 'adm@sos.com', roles: ['ADMIN'] });
  });

  it('cria POLICE com username e PIN, sem email', async () => {
    users.create.mockResolvedValue({ id: 'U2', email: '', roles: ['POLICE'] });

    const sut = makeSut();
    const out = await sut.execute({ username: 'gcm01', password: '654321', roles: ['POLICE'] });

    expect(users.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: '', username: 'gcm01', roles: ['POLICE'] }),
    );
    expect(out).toEqual({ userId: 'U2', email: '', roles: ['POLICE'] });
  });

  it('cria CITIZEN com profile quando phone presente', async () => {
    users.findByEmail.mockResolvedValue(null);
    users.create.mockResolvedValue({ id: 'U3', email: 'c@sos.com', roles: ['CITIZEN'] });

    const sut = makeSut();
    const out = await sut.execute({
      email: 'c@sos.com',
      password: '123456',
      roles: ['CITIZEN'],
      phone: '+55 11 9999',
      city: 'SP',
    });

    expect(citizens.create).toHaveBeenCalledWith(expect.objectContaining({ userId: 'U3' }));
    expect(out).toEqual({ userId: 'U3', email: 'c@sos.com', roles: ['CITIZEN'] });
  });

  it('recusa email duplicado quando informado', async () => {
    users.findByEmail.mockResolvedValue({ id: 'X' });
    const sut = makeSut();
    await expect(
      sut.execute({ email: 'dup@sos.com', password: 'x', roles: ['ADMIN'] }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
