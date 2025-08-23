import { BadRequestException, Injectable } from '@nestjs/common';
import { IncidentEventType, PrismaClient } from '@prisma/client';

@Injectable()
export class CloseIncidentRoomUseCase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(input: { incidentId: string }) {
    const incident = await this.prisma.incident.findUnique({ where: { id: input.incidentId } });
    if (!incident) throw new BadRequestException('Incident not found');

    await this.prisma.incident.update({
      where: { id: incident.id },
      data: { audioRoomId: null },
    });

    await this.prisma.incidentEvent.create({
      data: {
        incidentId: incident.id,
        type: IncidentEventType.VOICE_ROOM_CLOSED,
        payload: {},
      },
    });

    return { ok: true };
  }
}
