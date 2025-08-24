import { Injectable } from '@nestjs/common';
import { PrismaClient, IncidentStatus } from '@prisma/client';

@Injectable()
export class IncidentsQuery {
  constructor(private readonly prisma: PrismaClient) {}

  async listOpenWithDispatches() {
    return this.prisma.incident.findMany({
      where: { status: { in: [IncidentStatus.OPEN, IncidentStatus.IN_DISPATCH] } },
      orderBy: { createdAt: 'desc' },
      include: { dispatches: true },
    });
  }
}
