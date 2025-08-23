import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class ListCitizenUsersUseCase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute() {
    const rows = await this.prisma.user.findMany({
      where: { roles: { has: 'CITIZEN' } },
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, createdAt: true },
    });
    return rows;
  }
}

