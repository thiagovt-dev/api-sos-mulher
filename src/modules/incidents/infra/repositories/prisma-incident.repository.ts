import { Injectable } from '@nestjs/common';
import { PrismaClient, IncidentStatus } from '@prisma/client';

@Injectable()
export class PrismaIncidentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  create(input: {
    code: string;
    lat: number;
    lng: number;
    address?: string | null;
    description?: string | null;
  }) {
    return this.prisma.incident.create({
      data: {
        code: input.code,
        lat: input.lat,
        lng: input.lng,
        address: input.address ?? null,
        description: input.description ?? null,
        status: IncidentStatus.OPEN,
        events: { create: { type: 'CREATED', payload: {} } },
      },
    });
  }

  listOpen() {
    return this.prisma.incident.findMany({
      where: { status: { in: [IncidentStatus.OPEN, IncidentStatus.IN_DISPATCH] } },
      orderBy: { createdAt: 'desc' },
      include: { dispatches: true },
    });
  }

  findById(id: string) {
    return this.prisma.incident.findUnique({ where: { id }, include: { dispatches: true } });
  }
}
