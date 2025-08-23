import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminResetUnitPinUseCase {
  constructor(private prisma: PrismaClient) {}
  private genPin() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async execute(unitId: string) {
    const unit = await this.prisma.unit.findUnique({ where: { id: unitId } });
    if (!unit) throw new NotFoundException('Unit not found');

    const pin = this.genPin();
    const hash = await bcrypt.hash(pin, 10);
    await this.prisma.user.update({ where: { id: unitId }, data: { passwordHash: hash } });

    return { unitId, pin };
  }
}
