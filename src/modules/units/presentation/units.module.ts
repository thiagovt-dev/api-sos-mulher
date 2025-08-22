import { Module } from '@nestjs/common';
import { UnitsController } from './units.controller';
import { PrismaClient } from '@prisma/client';
import { PrismaUnitRepository } from '../infra/repositories/prisma-units.repository';
import { AdminCreateUnitUseCase } from '../application/use-cases/admin-create-unit.use-case';
import { AdminResetUnitPinUseCase } from '../application/use-cases/admin-reset-unit-pin.use-case';
import { AdminUpdateUnitUseCase } from '../application/use-cases/admin-update-unit.use-case';

@Module({
  controllers: [UnitsController],
  providers: [
    PrismaClient,
    PrismaUnitRepository,
    AdminCreateUnitUseCase,
    AdminResetUnitPinUseCase,
    AdminUpdateUnitUseCase,
  ],
  exports: [PrismaUnitRepository],
})
export class UnitsModule {}
