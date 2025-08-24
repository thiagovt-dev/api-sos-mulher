import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { VoiceController } from './voice.controller';
import { JoinIncidentRoomUseCase } from '../application/use-cases/join-incident-room.use-case';
import { LivekitAuthAdapter } from '../infra/livekit-auth.adapter';
import { LivekitAuthPort } from '../domain/livekit-auth.port';
import { CloseIncidentRoomUseCase } from '../application/use-cases/close-incident-room.use-case';
import { VoiceAccessService } from '../application/services/voice-access.service';
import { AudioRoomService } from '../application/services/audio-room.service';
import { IdentityService } from '../application/services/identity.service';
import { VoiceIncidentEventLogger } from '../application/services/voice-incident-event-logger.service';
import { LeaveIncidentRoomUseCase } from '../application/use-cases/leave-incident-room.use-case';

@Module({
  controllers: [VoiceController],
  providers: [
    PrismaClient,
    JoinIncidentRoomUseCase,
    CloseIncidentRoomUseCase,
    LeaveIncidentRoomUseCase,
    VoiceAccessService,
    AudioRoomService,
    IdentityService,
    VoiceIncidentEventLogger,

    { provide: LivekitAuthPort, useClass: LivekitAuthAdapter },
  ],
  exports: [],
})
export class VoiceModule {}
