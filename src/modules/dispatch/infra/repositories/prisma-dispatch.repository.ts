import { Injectable } from '@nestjs/common';
import { PrismaClient, DispatchStatus } from '@prisma/client';

@Injectable()
export class PrismaDispatchRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async assign(incidentId: string, unitId: string) {
    const [created] = await this.prisma.$transaction([
      this.prisma.dispatch.create({
        data: { incidentId, unitId, status: DispatchStatus.PENDING },
        include: { incident: true, unit: true },
      }),
      this.prisma.incident.update({
        where: { id: incidentId },
        data: { status: 'IN_DISPATCH' },
      }),
    ]);
    return created;
  }

  markNotified(id: string) {
    return this.prisma.dispatch.update({
      where: { id },
      data: { status: DispatchStatus.NOTIFIED, notifiedAt: new Date() },
    });
  }
}
