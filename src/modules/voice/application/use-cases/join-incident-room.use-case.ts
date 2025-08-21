import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaClient, IncidentEventType } from '@prisma/client';
import { LivekitAuthPort } from '../../domain/livekit-auth.port';

type JoinInput = {
  incidentId: string;
  participantType: 'UNIT' | 'DISPATCHER' | 'VICTIM';
  participantId?: string;
  mode: 'PTT' | 'FULL' | 'LISTEN';
  name?: string;
};

@Injectable()
export class JoinIncidentRoomUseCase {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly lk: LivekitAuthPort,
  ) {}

  async execute(input: JoinInput) {
    const incident = await this.prisma.incident.findUnique({ where: { id: input.incidentId } });
    if (!incident) throw new BadRequestException('Incident not found');

    const roomName = incident.audioRoomId ?? `inc_${incident.code ?? incident.id}`;
    if (!incident.audioRoomId) {
      await this.prisma.incident.update({
        where: { id: incident.id },
        data: { audioRoomId: roomName },
      });
    }

    const canPublishAudio = input.mode !== 'LISTEN';

    // 🔧 corrige o ternário: VICTIM cai no último branch
    const identity =
      input.participantType === 'UNIT'
        ? `unit:${input.participantId ?? 'unknown'}`
        : input.participantType === 'DISPATCHER'
          ? `user:${input.participantId ?? 'unknown'}`
          : `victim:${incident.id}`;

    const token = await this.lk.mintToken({
      roomName,
      identity,
      name: input.name ?? input.participantType,
      canPublishAudio,
      canSubscribe: true,
      metadata: {
        incidentId: incident.id,
        participantType: input.participantType,
        participantId: input.participantId ?? null,
        mode: input.mode,
      },
    });

    await this.prisma.incidentEvent.create({
      data: {
        incidentId: incident.id,
        type: IncidentEventType.VOICE_JOIN_ISSUED, 
        payload: { identity, participantType: input.participantType, mode: input.mode },
      },
    });

    return { url: this.lk.getUrl(), roomName, token, identity, mode: input.mode };
  }
}
