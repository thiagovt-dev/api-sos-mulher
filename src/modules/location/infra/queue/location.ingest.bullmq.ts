import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { LocationSample } from '../../domain/location.domain';
import { LocationIngestRepository } from '../../domain/repositories/location.ingest.repository';

export type LocationJobPayload = {
  userId: string;
  unitId?: string;
  incidentId?: string;
  lat: number;
  lng: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  source: 'MOBILE' | 'WEB';
  recordedAtISO: string;
};

@Injectable()
export class BullmqLocationIngestAdapter implements LocationIngestRepository {
  private readonly queue: Queue<LocationJobPayload>;

  constructor() {
    const connection = process.env.REDIS_URL
      ? { url: process.env.REDIS_URL }
      : {
          host: process.env.REDIS_HOST ?? 'localhost',
          port: Number(process.env.REDIS_PORT ?? 6379),
        };

    this.queue = new Queue<LocationJobPayload>('location.ingest', {
      connection,
      defaultJobOptions: {
        removeOnComplete: 2000,
        removeOnFail: 5000,
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      },
    });
  }

  async enqueue(sample: LocationSample): Promise<{ jobId: string }> {
    const payload: LocationJobPayload = {
      userId: sample.userId,
      unitId: sample.unitId,
      incidentId: sample.incidentId,
      lat: sample.lat,
      lng: sample.lng,
      accuracy: sample.accuracy,
      speed: sample.speed,
      heading: sample.heading,
      source: sample.source,
      recordedAtISO: sample.recordedAt.toISOString(),
    };

    const job = await this.queue.add('store', payload, {
      jobId: `${payload.userId}:${payload.recordedAtISO}:${payload.lat},${payload.lng}`,
    });

    return { jobId: String(job.id) };
  }
}
