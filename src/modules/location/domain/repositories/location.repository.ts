import { LocationSample } from '../location.domain';

export interface LocationRepository {
  create(sample: LocationSample): Promise<{ id: string }>;
}
