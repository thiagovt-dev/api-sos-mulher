import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { LocationController } from './location.controller';
import { PrismaLocationRepository } from '../infra/prisma/location.repository.prisma';
import { RecordLocationUseCase } from '../application/use-cases/record-location.use-case';
import { LocationRepository } from '../domain/repositories/location.repository';


@Module({
  controllers: [LocationController],
  providers: [
    PrismaClient,
    { provide: 'LocationRepository', useClass: PrismaLocationRepository },
    {
      provide: RecordLocationUseCase,
      useFactory: (repo: LocationRepository) => new RecordLocationUseCase(repo),
      inject: ['LocationRepository'],
    },
  ],
})
export class LocationModule {}
