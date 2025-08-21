import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaUnitRepository {
  constructor(private readonly prisma: PrismaClient) {}

  create(input: {
    name: string;
    plate?: string | null;
    fcmToken?: string | null;
    lat?: number | null;
    lng?: number | null;
  }) {
    return this.prisma.unit.create({
      data: {
        name: input.name,
        plate: input.plate ?? null,
        fcmToken: input.fcmToken ?? null,
        lastLat: input.lat ?? null,
        lastLng: input.lng ?? null,
        active: true,
      },
    });
  }

  listActive() {
    return this.prisma.unit.findMany({ where: { active: true }, orderBy: { createdAt: 'desc' } });
  }

  updateToken(id: string, fcmToken: string) {
    return this.prisma.unit.update({ where: { id }, data: { fcmToken } });
  }
}
