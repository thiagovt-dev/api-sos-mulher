import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UpdateCitizenProfileDto } from '../dto/update-citizen-profile.dto';

@Injectable()
export class UpdateMyCitizenProfileUseCase {
  constructor(private prisma: PrismaClient) {}

  async execute(userId: string, dto: UpdateCitizenProfileDto) {
    if (!dto.phone || !dto.phone.trim()) {
      throw new Error('phone is required');
    }

    const payload: any = { ...dto };
    if (payload.lat !== undefined) payload.lat = String(payload.lat);
    if (payload.lng !== undefined) payload.lng = String(payload.lng);

    return this.prisma.citizenProfile.upsert({
      where: { userId },
      update: payload,
      create: { userId, ...payload },
    });
  }
}
