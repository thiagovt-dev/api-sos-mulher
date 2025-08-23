import { BadRequestException } from '@nestjs/common';
import { RegisterCitizenUseCase } from '../../use-cases/register-citizen.use-case';

describe('RegisterCitizenUseCase (unit)', () => {
  const users = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  } as any;
  const citizens = { create: jest.fn() } as any;
  const hasher = { hash: jest.fn().mockResolvedValue('hashed') } as any;
  const tokens = { mint: jest.fn().mockResolvedValue({ access_token: 'tkn' }) } as any;

  beforeEach(() => jest.clearAllMocks());

  it('registra cidadão, cria profile quando phone e emite token', async () => {
    users.findByEmail.mockResolvedValue(null);
    users.create.mockResolvedValue({ id: 'U1', email: 'm@x.com', roles: ['CITIZEN'] });

    const sut = new RegisterCitizenUseCase(users, citizens, hasher, tokens);

    const out = await sut.execute({
      email: 'm@x.com',
      password: '123456',
      name: 'Maria',
      phone: '+55 11 9',
      city: 'SP',
    });

    expect(hasher.hash).toHaveBeenCalledWith('123456');
    expect(users.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'm@x.com', roles: ['CITIZEN'] }),
    );
    expect(citizens.create).toHaveBeenCalledWith(expect.objectContaining({ userId: 'U1' }));
    expect(tokens.mint).toHaveBeenCalledWith({ sub: 'U1', roles: ['CITIZEN'], email: 'm@x.com' });
    expect(out).toEqual({ access_token: 'tkn' });
  });

  it('recusa email duplicado', async () => {
    users.findByEmail.mockResolvedValue({ id: 'X' });
    const sut = new RegisterCitizenUseCase(users, citizens, hasher, tokens);
    await expect(
      sut.execute({ email: 'dup@s.com', password: 'x' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

