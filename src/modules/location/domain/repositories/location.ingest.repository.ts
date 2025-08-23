import { LocationSample } from '../location.domain';

export interface LocationIngestRepository {
  enqueue(sample: LocationSample): Promise<{ jobId: string }>;
}
