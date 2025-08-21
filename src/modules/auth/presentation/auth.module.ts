import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';

import { PrismaClient } from '@prisma/client';
import { AuthService } from '../application/auth.service';
import { JwtStrategy } from '../infra/strategies/jwt.strategy';
import { PrismaUserRepository } from '@/modules/users/infra/repositories/prisma-user.repository';
import { UsersModule } from '@/modules/users/presentation/users.module';
import { CreateUserUseCase } from '@/modules/users/application/use-cases/create-user.use-case';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'dev_super_secret',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN ?? '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, PrismaClient, PrismaUserRepository, CreateUserUseCase],
  exports: [JwtModule, PassportModule, AuthService],
})
export class AuthModule {}
