import type { Incident, IncidentStatus } from '../entities/incident.entity';

export abstract class IncidentRepository {
  abstract findById(id: string): Promise<Incident | null>;

  abstract create(input: {
    code: string;
    lat: number;
    lng: number;
    address?: string | null;
    description?: string | null;
    citizenId?: string | null;
  }): Promise<Incident>;

  abstract listOpen(): Promise<Incident[]>;
  abstract closeIncident(input: {
    incidentId: string;
    newStatus: IncidentStatus;
    closedById: string;
    closedReason?: string;
  }): Promise<Incident>;
}
