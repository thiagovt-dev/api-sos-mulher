import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { LivekitAuthPort } from '../../domain/livekit-auth.port';
import { AudioRoomService } from '../services/audio-room.service';
import { IdentityService } from '../services/identity.service';
import { VoiceIncidentEventLogger } from '../services/voice-incident-event-logger.service';
import { VoiceAccessService } from '../services/voice-access.service';
import { CurrentUser, VoiceMode } from '../types/type';

type JoinInput = { incidentId: string; mode?: VoiceMode; name?: string };

@Injectable()
export class JoinIncidentRoomUseCase {
  constructor(
    private prisma: PrismaClient,
    private lk: LivekitAuthPort,
    private access: VoiceAccessService,
    private rooms: AudioRoomService,
    private ids: IdentityService,
    private events: VoiceIncidentEventLogger,
  ) {}

  async execute(user: CurrentUser, input: JoinInput) {
    const incident = await this.prisma.incident.findUnique({ where: { id: input.incidentId } });
    if (!incident) throw new BadRequestException('Incident not found');

    const { role, defaultMode } = await this.access.authorize(user, incident);
    const roomName = await this.rooms.ensureRoom(incident);
    const mode = input.mode ?? defaultMode;
    const { identity, displayName } = this.ids.make(role, user.sub, input.name);

    const token = await this.lk.mintToken({
      roomName,
      identity,
      name: displayName,
      canPublishAudio: mode !== 'LISTEN',
      canSubscribe: true,
      metadata: { incidentId: incident.id, role, userId: user.sub, mode },
    });

    await this.events.voiceJoined(incident.id, identity, role, mode);

    return { url: this.lk.getUrl(), roomName, token, identity, mode };
  }
}
