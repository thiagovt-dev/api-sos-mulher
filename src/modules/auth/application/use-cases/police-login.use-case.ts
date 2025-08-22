import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class PoliceLoginUseCase {
  constructor(
    private prisma: PrismaClient,
    private jwt: JwtService,
  ) {}

  private normalize(login: string) {
    return login.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  async execute(input: { login: string; pin: string }) {
    const username = this.normalize(input.login);
    const user = await this.prisma.user.findFirst({
      where: { username, roles: { has: 'POLICE' } },
    });
    if (!user?.passwordHash) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(input.pin, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, roles: user.roles, typ: 'POLICE' as const };
    const access_token = await this.jwt.signAsync(payload, {
      expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
    });

    return { access_token };
  }
}
