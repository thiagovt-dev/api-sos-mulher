import { Injectable } from '@nestjs/common';
import { LocationRepository } from '../../domain/repositories/location.repository';
import { PrismaClient } from '@prisma/client';
import { LocationSample } from '../../domain/location.domain';

@Injectable()
export class PrismaLocationRepository implements LocationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private dec(v?: number) {
    return v === undefined ? undefined : String(v);
  }

  async create(sample: LocationSample): Promise<{ id: string }> {
    const created = await this.prisma.locationSample.create({
      data: {
        userId: sample.userId,
        unitId: sample.unitId,
        incidentId: sample.incidentId,
        lat: String(sample.lat),
        lng: String(sample.lng),
        accuracy: this.dec(sample.accuracy),
        speed: this.dec(sample.speed),
        heading: this.dec(sample.heading),
        source: sample.source,
        recordedAt: sample.recordedAt,
      },
      select: { id: true },
    });

    if (sample.unitId) {
      await this.prisma.unit.update({
        where: { id: sample.unitId },
        data: {
          lastLat: String(sample.lat),
          lastLng: String(sample.lng),
          lastSeenAt: new Date(),
        },
      });
    }

    return created;
  }
}
