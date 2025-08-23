import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { AuthTokenPort } from '@/shared/auth/domain/ports/auth-token.port';

@Injectable()
export class JwtAuthTokenService implements AuthTokenPort {
  constructor(private readonly jwt: JwtService) {}

  async mint(payload: { sub: string; roles: string[]; email?: string | null }) {
    const access_token = await this.jwt.signAsync(payload);
    return { access_token };
  }
}

