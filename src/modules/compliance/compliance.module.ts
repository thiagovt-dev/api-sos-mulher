import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaClient } from '@prisma/client';
import { RetentionJobService } from './retention.job';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [PrismaClient, RetentionJobService],
})
export class ComplianceModule {}
