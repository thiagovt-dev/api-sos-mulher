import { Module } from '@nestjs/common';
import { DispatchController } from './dispatch.controller';
import { PrismaClient } from '@prisma/client';
import { IncidentsModule } from '@/modules/incidents/presentation/incidents.module';
import { PrismaDispatchRepository } from '../infra/repositories/prisma-dispatch.repository';
import { CreateDispatchUseCase } from '../application/use-cases/create-dispatch.use-case';
import { RedlockService } from '@/shared/locks/redlock.service';
import { FcmService } from '@/shared/notifications/fcm.service';
import { BullmqModule } from '@/infra/queue/bullmq.module';

@Module({
  imports: [BullmqModule, IncidentsModule],
  controllers: [DispatchController],
  providers: [
    PrismaClient,
    PrismaDispatchRepository,
    CreateDispatchUseCase,
    RedlockService,
    FcmService,
  ],
})
export class DispatchModule {}
