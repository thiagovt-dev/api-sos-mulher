import { Injectable } from '@nestjs/common';
import { PrismaClient, DevicePlatform } from '@prisma/client';

type UpsertInput = {
  token: string;
  platform: DevicePlatform;
  unitId?: string | null;
  userId?: string | null;
  deviceId?: string | null;
  appVersion?: string | null;
};

@Injectable()
export class PrismaDeviceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async registerOrUpdate(input: UpsertInput) {
    const now = new Date();
    return this.prisma.device.upsert({
      where: { token: input.token },
      update: {
        platform: input.platform,
        unitId: input.unitId ?? null,
        userId: input.userId ?? null,
        deviceId: input.deviceId ?? null,
        appVersion: input.appVersion ?? null,
        active: true,
        lastSeenAt: now,
      },
      create: {
        token: input.token,
        platform: input.platform,
        unitId: input.unitId ?? null,
        userId: input.userId ?? null,
        deviceId: input.deviceId ?? null,
        appVersion: input.appVersion ?? null,
        active: true,
        lastSeenAt: now,
      },
    });
  }

  listByUnit(unitId: string) {
    return this.prisma.device.findMany({ where: { unitId, active: true } });
  }

  deactivate(token: string) {
    return this.prisma.device.update({ where: { token }, data: { active: false } });
  }
}
