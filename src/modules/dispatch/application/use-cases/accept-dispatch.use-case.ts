import { IncidentsGateway } from '@/modules/incidents/infra/incidents.gateway';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaClient, DispatchStatus, IncidentStatus } from '@prisma/client';

@Injectable()
export class AcceptDispatchUseCase {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly gateway: IncidentsGateway,
  ) {}

  async execute(input: { dispatchId: string }) {
    const dispatch = await this.prisma.dispatch.findUnique({
      where: { id: input.dispatchId },
      include: { incident: true, unit: true },
    });
    if (!dispatch) throw new BadRequestException('Dispatch not found');

    if (!([DispatchStatus.PENDING, DispatchStatus.NOTIFIED] as DispatchStatus[]).includes(dispatch.status)) {
      throw new BadRequestException('Dispatch cannot be accepted in current status');
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.dispatch.update({
        where: { id: input.dispatchId },
        data: { status: DispatchStatus.ACCEPTED, acceptedAt: new Date() },
      }),
      this.prisma.incident.update({
        where: { id: dispatch.incidentId },
        data: { status: IncidentStatus.IN_DISPATCH },
      }),
      this.prisma.incidentEvent.create({
        data: {
          incidentId: dispatch.incidentId,
          type: 'UNIT_ACCEPTED',
          payload: { dispatchId: dispatch.id, unitId: dispatch.unitId },
        },
      }),
    ]);

    const fresh = await this.prisma.incident.findUnique({
      where: { id: dispatch.incidentId },
      include: { dispatches: true },
    });
    this.gateway.emitUpdated(fresh);

    return { ok: true, dispatchId: updated.id, status: updated.status };
  }
}
