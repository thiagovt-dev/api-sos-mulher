import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Worker } from 'bullmq';
import { LocationJobPayload } from './location.ingest.bullmq';
import { GeoPoint, LocationSample } from '../../domain/location.domain';
import type { LocationRepository } from '../../domain/repositories/location.repository';

@Injectable()
export class LocationIngestWorker implements OnModuleInit, OnModuleDestroy {
  private worker?: Worker<LocationJobPayload>;
  private readonly logger = new Logger(LocationIngestWorker.name);

  constructor(@Inject('LocationRepository') private readonly repo: LocationRepository) {}

  onModuleInit() {
    const connection = process.env.REDIS_URL
      ? { url: process.env.REDIS_URL }
      : {
          host: process.env.REDIS_HOST ?? 'localhost',
          port: Number(process.env.REDIS_PORT ?? 6379),
        };

    this.worker = new Worker<LocationJobPayload>(
      'location.ingest',
      async (job) => {
        const p = job.data;

        const entity = LocationSample.create({
          userId: p.userId,
          unitId: p.unitId,
          incidentId: p.incidentId,
          point: new GeoPoint(p.lat, p.lng),
          accuracy: p.accuracy,
          speed: p.speed,
          heading: p.heading,
          source: p.source,
          recordedAt: new Date(p.recordedAtISO),
        });

        await this.repo.create(entity);
      },
      { connection },
    );

    this.worker.on('completed', (job) => this.logger.verbose(`Completed job ${job.id}`));
    this.worker.on('failed', (job, err) =>
      this.logger.warn(`Failed job ${job?.id}: ${err?.message}`),
    );
  }

  async onModuleDestroy() {
    await this.worker?.close();
  }
}
