import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { VoiceController } from './voice.controller';
import { JoinIncidentRoomUseCase } from '../application/use-cases/join-incident-room.use-case';
import { LivekitAuthAdapter } from '../infra/livekit-auth.adapter';
import { LivekitAuthPort } from '../domain/livekit-auth.port';
import { CloseIncidentRoomUseCase } from '../application/use-cases/close-incident-room.use-case';


@Module({
  controllers: [VoiceController],
  providers: [
    PrismaClient,
    JoinIncidentRoomUseCase,
    CloseIncidentRoomUseCase,
    { provide: LivekitAuthPort, useClass: LivekitAuthAdapter },
  ],
  exports: [],
})
export class VoiceModule {}
