import { IncidentsGateway } from '@/modules/incidents/infra/incidents.gateway';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaClient, IncidentStatus } from '@prisma/client';

@Injectable()
export class CloseIncidentUseCase {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly gateway: IncidentsGateway,
  ) {}

  async execute(input: { incidentId: string; reason?: string; as?: 'RESOLVED' | 'CANCELED' }) {
    const incident = await this.prisma.incident.findUnique({ where: { id: input.incidentId } });
    if (!incident) throw new BadRequestException('Incident not found');

    if (
      ([IncidentStatus.RESOLVED, IncidentStatus.CANCELED] as IncidentStatus[]).includes(incident.status)
    ) {
      throw new BadRequestException('Incident already closed');
    }

    const toStatus = (input.as ?? 'RESOLVED') as IncidentStatus;

    await this.prisma.$transaction([
      this.prisma.incident.update({
        where: { id: input.incidentId },
        data: { status: toStatus },
      }),
      this.prisma.incidentEvent.create({
        data: {
          incidentId: input.incidentId,
          type: 'STATUS_CHANGED',
          payload: { from: incident.status, to: toStatus, reason: input.reason ?? null },
        },
      }),
    ]);

    const fresh = await this.prisma.incident.findUnique({
      where: { id: input.incidentId },
      include: { dispatches: true },
    });
    this.gateway.emitUpdated(fresh);

    return { ok: true, incidentId: input.incidentId, status: fresh?.status };
  }
}
