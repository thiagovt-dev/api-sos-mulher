import { Dispatch } from './dispatch.entity';

export abstract class DispatchRepository {
  abstract create(dispatch: Dispatch): Promise<void>;
  abstract findUnique(incidentId: string, unitId: string): Promise<Dispatch | null>;
  abstract listByIncident(incidentId: string): Promise<Dispatch[]>;
}
