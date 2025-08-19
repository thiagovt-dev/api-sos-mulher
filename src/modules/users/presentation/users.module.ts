import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { CreateUserUseCase } from '../application/use-cases/create-user.use-case';
import { UserRepository } from '../domain/repositories/user.repository';
import { PrismaUserRepository } from '../infra/repositories/prisma-user.repository';

@Module({
  controllers: [UsersController],
  providers: [
    CreateUserUseCase,
    { provide: UserRepository, useClass: PrismaUserRepository },
  ],
  exports: [{ provide: UserRepository, useClass: PrismaUserRepository }],
})
export class UsersModule {}
