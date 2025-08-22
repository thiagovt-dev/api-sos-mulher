import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { CreateCitizenDto } from '../dto/create-citizen.dto';

@Injectable()
export class AdminCreateCitizenUseCase {
  constructor(private prisma: PrismaClient) {}

  async execute(dto: CreateCitizenDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new BadRequestException('email already in use');

    const hash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hash,
        roles: { set: ['CITIZEN'] },
      },
    });

    if (dto.phone) {
      await this.prisma.citizenProfile.create({
        data: {
          userId: user.id,
          phone: dto.phone,
          street: dto.street,
          number: dto.number,
          district: dto.district,
          city: dto.city,
          state: dto.state,
          zip: dto.zip,
          lat: dto.lat !== undefined ? String(dto.lat) : undefined,
          lng: dto.lng !== undefined ? String(dto.lng) : undefined,
        },
      });
    }

    return { userId: user.id, email: user.email };
  }
}
