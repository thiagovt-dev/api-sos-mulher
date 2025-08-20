import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaIncidentRepository } from '../../infra/repositories/prisma-incident.repository';

@Injectable()
export class CreateIncidentUseCase {
  constructor(private readonly repo: PrismaIncidentRepository) {}

  async execute(input: { lat: number; lng: number; address?: string; description?: string }) {
    const code = `INC-${randomBytes(3).toString('hex').toUpperCase()}`; // ex: INC-9A21F3
    const incident = await this.repo.create({
      code,
      lat: input.lat,
      lng: input.lng,
      address: input.address,
      description: input.description,
    });
    return incident;
  }
}
