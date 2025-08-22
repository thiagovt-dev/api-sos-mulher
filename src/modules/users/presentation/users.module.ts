import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { CreateUserUseCase } from '../application/use-cases/create-user.use-case';
import { UserRepository } from '../domain/repositories/user.repository';
import { PrismaUserRepository } from '../infra/repositories/prisma-user.repository';
import { UsersMeController } from './users.me.controller';
import { UsersAdminController } from './users.admin.controller';
import { UpdateMyCitizenProfileUseCase } from '../application/use-cases/update-citizen-profile.use-case';
import { AdminCreateCitizenUseCase } from '../application/use-cases/admin-create-citizen.use-case';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [UsersController, UsersMeController, UsersAdminController],
  providers: [
    PrismaClient,
    CreateUserUseCase,
    { provide: UserRepository, useClass: PrismaUserRepository },
    UpdateMyCitizenProfileUseCase,
    AdminCreateCitizenUseCase,
  ],
  exports: [{ provide: UserRepository, useClass: PrismaUserRepository }, CreateUserUseCase],
})
export class UsersModule {}
