import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class AdminUpdateUnitUseCase {
  constructor(private prisma: PrismaClient) {}

  async execute(unitId: string, dto: { name?: string; plate?: string; active?: boolean }) {
    const unit = await this.prisma.unit.findUnique({ where: { id: unitId } });
    if (!unit) throw new NotFoundException('Unit not found');

    const updated = await this.prisma.unit.update({
      where: { id: unitId },
      data: {
        name: dto.name ?? unit.name,
        plate: dto.plate ?? unit.plate,
        active: dto.active ?? unit.active,
      },
    });
    return updated;
  }
}
