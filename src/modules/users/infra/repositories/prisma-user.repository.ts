import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infra/database/prisma.service';
import { UserRepository } from '../../domain/repositories/user.repository';
import { AppRole, User } from '../../domain/entities/user.entity';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: { email: string; passwordHash: string; roles?: ('CITIZEN' | 'POLICE' | 'ADMIN')[]; username?: string | null }): Promise<User> {
    const row = await this.prisma.user.create({
      data: {
        email: input.email,
        passwordHash: input.passwordHash,
        username: input.username ?? null,
        roles: { set: input.roles ?? ['CITIZEN'] },
      },
    });
    return new User(
      row.id,
      row.email,
      row.username,
      row.passwordHash,
      (row.roles ?? []) as unknown as AppRole[],
      row.createdAt,
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { email } });
    return row
      ? new User(
          row.id,
          row.email,
          row.username,
          row.passwordHash,
          (row.roles ?? []) as unknown as AppRole[],
          row.createdAt,
        )
      : null;
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    return row
      ? new User(
          row.id,
          row.email,
          row.username,
          row.passwordHash,
          (row.roles ?? []) as unknown as AppRole[],
          row.createdAt,
        )
      : null;
  }
}
