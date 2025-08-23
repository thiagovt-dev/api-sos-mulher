import { Citizen } from '../entities/citizen.entity';

export abstract class CitizenRepository {
  /**
   * Creates a citizen letting the database generate the UUID id.
   * Returns the persisted citizen entity.
   */
  abstract create(input: {
    userId: string;
    name?: string | null;
    phone?: string | null;
    street?: string | null;
    number?: string | null;
    district?: string | null;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
    lat?: number | null;
    lng?: number | null;
  }): Promise<Citizen>;

  abstract findCitizenById(userId: string): Promise<Citizen | null>;
}
