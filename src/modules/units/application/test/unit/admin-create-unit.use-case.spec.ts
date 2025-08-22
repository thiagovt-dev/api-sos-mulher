import { BadRequestException } from '@nestjs/common';
import { AdminCreateUnitUseCase } from '../../use-cases/admin-create-unit.use-case';

jest.mock('bcryptjs', () => ({ hash: jest.fn().mockResolvedValue('hashed_pin') }));

describe('AdminCreateUnitUseCase (unit)', () => {
  const prisma = {
    user: {
      findFirst: jest.fn(),
      create: jest.fn().mockResolvedValue({ id: 'U1', username: 'gcm01' }),
    },
    unit: { create: jest.fn().mockResolvedValue({ id: 'U1', name: 'GCM 01' }) },
  } as any;

  beforeEach(() => jest.clearAllMocks());

  it('cria user POLICE e unit com pin fornecido', async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    const sut = new AdminCreateUnitUseCase(prisma);
    const out = await sut.execute({ name: 'GCM 01', plate: 'ABC-1234', login: 'GCM-01', pin: '654321' });

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ roles: { set: ['POLICE'] } }) }),
    );
    expect(prisma.unit.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ id: 'U1', name: 'GCM 01' }) }),
    );
    expect(out).toEqual({ unitId: 'U1', username: 'gcm01', pin: expect.any(String) });
  });

  it('gera pin quando não informado e recusa login duplicado', async () => {
    prisma.user.findFirst.mockResolvedValue({ id: 'X' });
    const sut = new AdminCreateUnitUseCase(prisma);
    await expect(sut.execute({ name: 'GCM 02', login: 'gcm02' })).rejects.toBeInstanceOf(BadRequestException);
  });
});

