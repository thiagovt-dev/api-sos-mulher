import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthTokenService } from '@/shared/auth/infra/jwt-auth-token.service';
import { AUTH_TOKEN_PORT } from '@/shared/auth/domain/ports/tokens';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'dev_super_secret',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN ?? '15m' },
    }),
  ],
  providers: [
    JwtAuthTokenService,
    { provide: AUTH_TOKEN_PORT, useClass: JwtAuthTokenService },
  ],
  exports: [JwtModule, { provide: AUTH_TOKEN_PORT, useClass: JwtAuthTokenService }],
})
export class SharedAuthModule {}

