import { NotFoundException } from '@nestjs/common';
import { AdminUpdateUnitUseCase } from '../../use-cases/admin-update-unit.use-case';

describe('AdminUpdateUnitUseCase (unit)', () => {
  const prisma = {
    unit: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  } as any;

  beforeEach(() => jest.clearAllMocks());

  it('atualiza unit quando existe', async () => {
    prisma.unit.findUnique.mockResolvedValue({ id: 'U1', name: 'A', plate: 'P', active: true });
    prisma.unit.update.mockResolvedValue({ id: 'U1', name: 'B', plate: 'P2', active: false });
    const sut = new AdminUpdateUnitUseCase(prisma);
    const out = await sut.execute('U1', { name: 'B', plate: 'P2', active: false });
    expect(out).toEqual({ id: 'U1', name: 'B', plate: 'P2', active: false });
  });

  it('lança NotFound quando não existe', async () => {
    prisma.unit.findUnique.mockResolvedValue(null);
    const sut = new AdminUpdateUnitUseCase(prisma);
    await expect(sut.execute('NA', { name: 'X' })).rejects.toBeInstanceOf(NotFoundException);
  });
});

