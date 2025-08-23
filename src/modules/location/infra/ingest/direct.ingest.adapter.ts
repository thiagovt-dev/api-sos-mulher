import { Injectable, Inject } from '@nestjs/common';
import { LocationSample } from '../../domain/location.domain';
import { LocationIngestRepository } from '../../domain/repositories/location.ingest.repository';
import type { LocationRepository } from '../../domain/repositories/location.repository';

@Injectable()
export class DirectLocationIngestAdapter implements LocationIngestRepository {
  constructor(@Inject('LocationRepository') private readonly repo: LocationRepository) {}

  async enqueue(sample: LocationSample): Promise<{ jobId: string }> {
    const { id } = await this.repo.create(sample);
    return { jobId: `direct:${id}` };
  }
}
