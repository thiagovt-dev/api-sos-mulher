import { Injectable } from '@nestjs/common';
import { IncidentEventType, PrismaClient } from '@prisma/client';
import { AppRole, VoiceMode } from '../types/type';

@Injectable()
export class IncidentEventLogger {
  constructor(private prisma: PrismaClient) {}

  async voiceJoined(incidentId: string, identity: string, role: AppRole, mode: VoiceMode) {
    await this.prisma.incidentEvent.create({
      data: {
        incidentId,
        type: IncidentEventType.VOICE_JOINED,
        payload: { identity, role, mode } as any,
      },
    });
  }

  async voiceLeft(incidentId: string, identity: string, role: AppRole) {
    await this.prisma.incidentEvent.create({
      data: { incidentId, type: IncidentEventType.VOICE_LEFT, payload: { identity, role } as any },
    });
  }
}
