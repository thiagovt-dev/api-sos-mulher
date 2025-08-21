import { Module } from '@nestjs/common';
import { UnitsController } from './units.controller';
import { PrismaClient } from '@prisma/client';
import { PrismaUnitRepository } from '../infra/repositories/prisma-units.repository';

@Module({
  controllers: [UnitsController],
  providers: [PrismaClient, PrismaUnitRepository],
  exports: [PrismaUnitRepository],
})
export class UnitsModule {}
