import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { IncidentRepository } from '../../domain/repositories/incident.repository';
import { IncidentsGateway } from '../../infra/incidents.gateway';

@Injectable()
export class CreateIncidentUseCase {
  constructor(
    private readonly repo: IncidentRepository, 
    private readonly gateway: IncidentsGateway,
  ) {}

  async execute(input: {
    lat: number;
    lng: number;
    address?: string;
    description?: string;
    citizenId?: string | null;
  }) {
    const code = `INC-${randomBytes(3).toString('hex').toUpperCase()}`;

    const incident = await this.repo.create({
      code,
      lat: input.lat,
      lng: input.lng,
      address: input.address ?? null,
      description: input.description ?? null,
      citizenId: input.citizenId ?? null,
    });

    this.gateway.emitCreated(incident);
    return incident;
  }
}
