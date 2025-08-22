import { NotFoundException } from '@nestjs/common';
import { AdminResetUnitPinUseCase } from '../../use-cases/admin-reset-unit-pin.use-case';

jest.mock('bcryptjs', () => ({ hash: jest.fn().mockResolvedValue('hashed_new_pin') }));

describe('AdminResetUnitPinUseCase (unit)', () => {
  const prisma = {
    unit: { findUnique: jest.fn() },
    user: { update: jest.fn() },
  } as any;

  beforeEach(() => jest.clearAllMocks());

  it('redefine PIN quando unit existe', async () => {
    prisma.unit.findUnique.mockResolvedValue({ id: 'U1' });
    const sut = new AdminResetUnitPinUseCase(prisma);
    const out = await sut.execute('U1');
    expect(prisma.user.update).toHaveBeenCalled();
    expect(out).toEqual({ unitId: 'U1', pin: expect.any(String) });
    expect(out.pin).toHaveLength(6);
  });

  it('lança NotFound quando unit não existe', async () => {
    prisma.unit.findUnique.mockResolvedValue(null);
    const sut = new AdminResetUnitPinUseCase(prisma);
    await expect(sut.execute('NA')).rejects.toBeInstanceOf(NotFoundException);
  });
});

