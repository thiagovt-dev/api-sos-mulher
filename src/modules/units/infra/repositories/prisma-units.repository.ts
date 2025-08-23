import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class PrismaUnitRepository {
  constructor(private readonly prisma: PrismaClient) {}

  create(input: {
    name: string;
    plate?: string | null;
    fcmToken?: string | null;
    lat?: number | null;
    lng?: number | null;
    username?: string | null;
    pin?: string | null;
  }) {
    return this.prisma.$transaction(async (tx) => {
      let user;
      if (input.username && input.pin) {
        const passwordHash = await bcrypt.hash(input.pin, 10);
        user = await tx.user.create({
          data: {
            email: null,
            username: input.username,
            passwordHash,
            roles: { set: ['POLICE'] },
          },
        });
      } else {
        user = await tx.user.create({
          data: {
            email: null,
            username: null,
            passwordHash: null,
            roles: { set: ['POLICE'] },
          },
        });
      }

      const unit = await tx.unit.create({
        data: {
          id: user.id,
          name: input.name,
          plate: input.plate ?? null,
          fcmToken: input.fcmToken ?? null,
          lastLat: input.lat ?? null,
          lastLng: input.lng ?? null,
          active: true,
        },
      });
      return unit;
    });
  }

  listActive() {
    return this.prisma.unit.findMany({ where: { active: true }, orderBy: { createdAt: 'desc' } });
  }

  updateToken(id: string, fcmToken: string) {
    return this.prisma.unit.update({ where: { id }, data: { fcmToken } });
  }
}
