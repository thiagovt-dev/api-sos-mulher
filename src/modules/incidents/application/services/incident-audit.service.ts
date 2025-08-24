import { Injectable } from '@nestjs/common';
import { PrismaClient, IncidentEventType } from '@prisma/client';

@Injectable()
export class IncidentAuditService {
  constructor(private readonly prisma: PrismaClient) {}

  async statusChanged(
    incidentId: string,
    from: string,
    to: string,
    actorId: string,
    reason?: string,
  ) {
    await this.prisma.incidentEvent.create({
      data: {
        incidentId,
        type: IncidentEventType.STATUS_CHANGED,
        payload: { from, to, actorId, reason } as any,
      },
    });
  }
}
