import { Injectable, BadRequestException } from '@nestjs/common';
import type { IncidentStatus } from '../../domain/entities/incident.entity';
import { IncidentRepository } from '../../domain/repositories/incident.repository';

type CloseInput = {
  incidentId: string;
  reason?: string;
  as?: 'RESOLVED' | 'CANCELED';
  closedById: string; // passe o user.sub do guard
};

@Injectable()
export class CloseIncidentUseCase {
  constructor(private readonly incidents: IncidentRepository) {}

  async execute(input: CloseInput) {
    const current = await this.incidents.findById(input.incidentId);
    if (!current) throw new BadRequestException('Incident not found');

    const alreadyClosed = current.status === 'RESOLVED' || current.status === 'CANCELED';
    if (alreadyClosed) throw new BadRequestException('Incident already closed');

    const toStatus = (input.as ?? 'RESOLVED') as IncidentStatus;

    const updated = await this.incidents.closeIncident({
      incidentId: current.id,
      newStatus: toStatus,
      closedById: input.closedById,
      closedReason: input.reason,
    });

    return updated;
  }
}
