import { Injectable } from '@nestjs/common';
import { GeoPoint, LocationSample, deriveUnitId } from '../../domain/location.domain';
import type { LocationIngestRepository } from '../../domain/repositories/location.ingest.repository';

export type IngestLocationInput = {
  userId: string;
  roles: Array<'ADMIN' | 'POLICE' | 'CITIZEN'>;
  lat: number;
  lng: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  incidentId?: string;
  source?: 'MOBILE' | 'WEB';
  recordedAt?: Date;
};

@Injectable()
export class IngestLocationUseCase {
  constructor(private readonly ingest: LocationIngestRepository) {}

  async execute(input: IngestLocationInput) {
    const point = new GeoPoint(input.lat, input.lng);
    const unitId = deriveUnitId(input.userId, input.roles);

    const sample = LocationSample.create({
      userId: input.userId,
      unitId,
      incidentId: input.incidentId,
      point,
      accuracy: input.accuracy,
      speed: input.speed,
      heading: input.heading,
      source: input.source ?? 'MOBILE',
      recordedAt: input.recordedAt,
    });

    return this.ingest.enqueue(sample); // { jobId }
  }
}
