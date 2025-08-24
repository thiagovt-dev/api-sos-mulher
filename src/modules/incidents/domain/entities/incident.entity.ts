export const INCIDENT_STATUSES = ['OPEN', 'IN_DISPATCH', 'RESOLVED', 'CANCELED'] as const;
export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];

export class Incident {
  constructor(
    readonly id: string,
    readonly code: string,
    readonly lat: number,
    readonly lng: number,
    readonly address: string | null,
    readonly description: string | null,
    readonly status: IncidentStatus,
    readonly citizenId: string | null,
    readonly audioRoomId: string | null,
    readonly createdAt: Date,
    readonly updatedAt: Date,
    readonly closedAt: Date | null,
    readonly closedById: string | null,
    readonly closedReason: string | null,
  ) {}
}
