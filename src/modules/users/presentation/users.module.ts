import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { CreateUserUseCase } from '../application/use-cases/create-user.use-case';
import { UserRepository } from '../domain/repositories/user.repository';
import { PrismaUserRepository } from '../infra/repositories/prisma-user.repository';
import { UsersMeController } from './users.me.controller';
import { UsersAdminController } from './users.admin.controller';
import { UsersAdminUsersController } from './users.admin.users.controller';
import { UpdateMyCitizenProfileUseCase } from '../application/use-cases/update-citizen-profile.use-case';
import { AdminCreateUserUseCase } from '../application/use-cases/admin-create-user.use-case';
import { RegisterCitizenUseCase } from '../application/use-cases/register-citizen.use-case';
import { ListAllUsersUseCase } from '../application/use-cases/list-all-users.use-case';
import { ListCitizenUsersUseCase } from '../application/use-cases/list-citizen-users.use-case';
import { PrismaClient } from '@prisma/client';
import { CitizenRepository } from '../domain/repositories/citizen.repository';
import { PrismaCitizenRepository } from '../infra/repositories/prisma-citizen.repository';
import { BcryptPasswordHasher } from '@/shared/auth/infra/bcrypt-password-hasher.service';
import { PASSWORD_HASHER } from '@/shared/auth/domain/ports/tokens';
import { SharedAuthModule } from '@/shared/auth/shared-auth.module';

@Module({
  controllers: [UsersController, UsersMeController, UsersAdminController, UsersAdminUsersController],
  providers: [
    PrismaClient,
    CreateUserUseCase,
    RegisterCitizenUseCase,
    ListAllUsersUseCase,
    ListCitizenUsersUseCase,
    { provide: UserRepository, useClass: PrismaUserRepository },
    {provide: CitizenRepository, useClass: PrismaCitizenRepository},
    UpdateMyCitizenProfileUseCase,
    AdminCreateUserUseCase,
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
  ],
  imports: [SharedAuthModule],
  exports: [
    { provide: UserRepository, useClass: PrismaUserRepository },
    CreateUserUseCase,
    RegisterCitizenUseCase,
    ListAllUsersUseCase,
    ListCitizenUsersUseCase,
  ],
})
export class UsersModule {}
