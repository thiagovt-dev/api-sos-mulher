import { Injectable } from '@nestjs/common';
import { PrismaClient, IncidentStatus as DBStatus, Incident as DBIncident } from '@prisma/client';
import { IncidentRepository } from '../../domain/repositories/incident.repository';
import { Incident } from '../../domain/entities/incident.entity';

function toNumber(x: any): number {
  return x == null ? x : Number(x);
}

@Injectable()
export class PrismaIncidentRepository implements IncidentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toDomain(
    i: Pick<
      DBIncident,
      | 'id'
      | 'code'
      | 'lat'
      | 'lng'
      | 'address'
      | 'description'
      | 'status'
      | 'citizenId'
      | 'audioRoomId'
      | 'createdAt'
      | 'updatedAt'
      | 'closedAt'
      | 'closedById'
      | 'closedReason'
    >,
  ): Incident {
    return new Incident(
      i.id,
      i.code,
      toNumber(i.lat),
      toNumber(i.lng),
      i.address ?? null,
      i.description ?? null,
      i.status as any,
      i.citizenId ?? null,
      i.audioRoomId ?? null,
      i.createdAt,
      i.updatedAt,
      i.closedAt ?? null,
      i.closedById ?? null,
      i.closedReason ?? null,
    );
  }

  async create(input: {
    code: string;
    lat: number;
    lng: number;
    address?: string | null;
    description?: string | null;
    citizenId?: string | null;
  }): Promise<Incident> {
    const created = await this.prisma.incident.create({
      data: {
        code: input.code,
        lat: String(input.lat), // Decimal(9,6)
        lng: String(input.lng),
        address: input.address ?? null,
        description: input.description ?? null,
        citizenId: input.citizenId ?? null,
        status: DBStatus.OPEN,
        events: { create: { type: 'CREATED', payload: {} } },
      },
      select: {
        id: true,
        code: true,
        lat: true,
        lng: true,
        address: true,
        description: true,
        status: true,
        citizenId: true,
        audioRoomId: true,
        createdAt: true,
        updatedAt: true,
        closedAt: true,
        closedById: true,
        closedReason: true,
      },
    });
    return this.toDomain(created);
  }

  async listOpen(): Promise<Incident[]> {
    const rows = await this.prisma.incident.findMany({
      where: { status: { in: [DBStatus.OPEN, DBStatus.IN_DISPATCH] } },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        code: true,
        lat: true,
        lng: true,
        address: true,
        description: true,
        status: true,
        citizenId: true,
        audioRoomId: true,
        createdAt: true,
        updatedAt: true,
        closedAt: true,
        closedById: true,
        closedReason: true,
      },
    });
    return rows.map((r) => this.toDomain(r));
  }

  async findById(id: string): Promise<Incident | null> {
    const found = await this.prisma.incident.findUnique({
      where: { id },
      select: {
        id: true,
        code: true,
        lat: true,
        lng: true,
        address: true,
        description: true,
        status: true,
        citizenId: true,
        audioRoomId: true,
        createdAt: true,
        updatedAt: true,
        closedAt: true,
        closedById: true,
        closedReason: true,
      },
    });
    return found ? this.toDomain(found) : null;
  }

  async closeIncident(input: {
    incidentId: string;
    newStatus: import('../../domain/entities/incident.entity').IncidentStatus;
    closedById: string;
    closedReason?: string;
  }): Promise<Incident> {
    const prev = await this.prisma.incident.findUnique({ where: { id: input.incidentId } });
    if (!prev) throw new Error('Incident not found');

    await this.prisma.$transaction([
      this.prisma.incident.update({
        where: { id: input.incidentId },
        data: {
          status: input.newStatus as unknown as DBStatus,
          closedAt: new Date(),
          closedById: input.closedById,
          closedReason: input.closedReason ?? null,
        },
      }),
      this.prisma.incidentEvent.create({
        data: {
          incidentId: input.incidentId,
          type: 'STATUS_CHANGED',
          payload: {
            from: prev.status,
            to: input.newStatus,
            actorId: input.closedById,
            reason: input.closedReason ?? null,
          } as any,
        },
      }),
    ]);

    const fresh = await this.prisma.incident.findUnique({
      where: { id: input.incidentId },
      select: {
        id: true,
        code: true,
        lat: true,
        lng: true,
        address: true,
        description: true,
        status: true,
        citizenId: true,
        audioRoomId: true,
        createdAt: true,
        updatedAt: true,
        closedAt: true,
        closedById: true,
        closedReason: true,
      },
    });
    return this.toDomain(fresh!);
  }
}
