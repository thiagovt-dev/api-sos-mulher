import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminCreateUnitUseCase {
  constructor(private prisma: PrismaClient) {}

  private normalizeLogin(s: string) {
    return s.toLowerCase().replace(/[^a-z0-9]/g, '');
  }
  private genPin() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6 dígitos
  }

  async execute(input: { name: string; plate?: string; login?: string; pin?: string; fcmToken?: string }) {
    const loginBase = input.login ?? input.plate ?? input.name;
    const username = this.normalizeLogin(loginBase);
    if (!username) throw new BadRequestException('login inválido');

    const exists = await this.prisma.user.findFirst({ where: { username } });
    if (exists) throw new BadRequestException('login já em uso');

    const pin = input.pin ?? this.genPin();
    const hash = await bcrypt.hash(pin, 10);

    const user = await this.prisma.user.create({
      data: {
        username,
        passwordHash: hash,
        roles: { set: ['POLICE'] },
      },
    });

    await this.prisma.unit.create({
      data: {
        id: user.id,
        name: input.name,
        plate: input.plate ?? null,
        active: true,
        fcmToken: input.fcmToken ?? null,
      },
    });

    return { unitId: user.id, username, pin };
  }
}
