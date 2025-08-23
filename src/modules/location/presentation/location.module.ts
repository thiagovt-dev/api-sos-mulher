import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { LocationController } from './location.controller';
import { PrismaLocationRepository } from '../infra/prisma/location.repository.prisma';
import { BullmqLocationIngestAdapter } from '../infra/queue/location.ingest.bullmq';
import { DirectLocationIngestAdapter } from '../infra/ingest/direct.ingest.adapter';
import { IngestLocationUseCase } from '../application/use-cases/ingest-location.use-case';
import { LocationIngestRepository } from '../domain/repositories/location.ingest.repository';
import { LocationIngestWorker } from '../infra/queue/location.ingest.worker';
import { RecordLocationUseCase } from '../application/use-cases/record-location.use-case';

const USE_QUEUE =
  (process.env.LOCATION_INGEST_MODE ??
    (process.env.NODE_ENV === 'production' ? 'queue' : 'direct')) === 'queue';

@Module({
  controllers: [LocationController],
  providers: [
    PrismaClient,
    { provide: 'LocationRepository', useClass: PrismaLocationRepository },

    {
      provide: 'LocationIngestRepository',
      useClass: USE_QUEUE ? BullmqLocationIngestAdapter : DirectLocationIngestAdapter,
    },

    {
      provide: IngestLocationUseCase,
      useFactory: (ingest: LocationIngestRepository) => new IngestLocationUseCase(ingest),
      inject: ['LocationIngestRepository'],
    },

    RecordLocationUseCase,
    ...(USE_QUEUE ? [LocationIngestWorker] : []),
  ],
})
export class LocationModule {}
