import { Injectable } from '@nestjs/common';
import { CitizenRepository } from '../../domain/repositories/citizen.repository';
import { PrismaClient } from '@prisma/client';
import { Citizen } from '../../domain/entities/citizen.entity';

@Injectable()
export class PrismaCitizenRepository implements CitizenRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: {
    userId: string;
    name?: string | null;
    phone?: string | null;
    street?: string | null;
    number?: string | null;
    district?: string | null;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
    lat?: number | null;
    lng?: number | null;
  }): Promise<Citizen> {
    const citizen = await this.prisma.citizenProfile.create({
      data: {
        userId: input.userId,
        phone: input.phone ?? '',
        street: input.street ?? '',
        number: input.number ?? '',
        district: input.district ?? '',
        city: input.city ?? '',
        state: input.state ?? '',
        zip: input.zip ?? null,
        lat: input.lat ?? null,
        lng: input.lng ?? null,
      },
    });
    return new Citizen(
      citizen.userId,
      citizen.name,
      citizen.phone,
      citizen.street,
      citizen.number,
      citizen.district,
      citizen.city,
      citizen.state,
      citizen.zip,
      Number(citizen.lat),
      Number(citizen.lng),
      citizen.createdAt,
    );
  }

  async findCitizenById(userId: string): Promise<Citizen | null> {
    const citizen = await this.prisma.citizenProfile.findUnique({
      where: { userId },
    });
    if (!citizen) return null;
    return new Citizen(
      citizen.userId,
      citizen.name,
      citizen.phone,
      citizen.street,
      citizen.number,
      citizen.district,
      citizen.city,
      citizen.state,
      citizen.zip,
      Number(citizen.lat),
      Number(citizen.lng),
      citizen.createdAt,
    );
  }
}
