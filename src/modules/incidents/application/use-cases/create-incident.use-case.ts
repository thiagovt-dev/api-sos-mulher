import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaIncidentRepository } from '../../infra/repositories/prisma-incident.repository';
import { IncidentsGateway } from '../../infra/incidents.gateway';

@Injectable()
export class CreateIncidentUseCase {
  constructor(
    private readonly repo: PrismaIncidentRepository,
    private readonly gateway: IncidentsGateway, 
  ) {}

  async execute(input: { lat: number; lng: number; address?: string; description?: string }) {
    const code = `INC-${randomBytes(3).toString('hex').toUpperCase()}`;
    const incident = await this.repo.create({
      code, lat: input.lat, lng: input.lng, address: input.address, description: input.description
    });

    const fresh = await this.repo.findById(incident.id);

    this.gateway.emitCreated(fresh);
    return fresh;
  }
}

