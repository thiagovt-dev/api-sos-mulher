import { Module } from '@nestjs/common';
import { DebugController } from './debug.controller';
import { PrismaClient } from '@prisma/client';
import { FcmService } from '../../shared/notifications/fcm.service';

@Module({
  imports: [],
  controllers: [DebugController],
  providers: [PrismaClient, FcmService],
})
export class DebugModule {}
