import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { IncidentsController } from './incidents.controller';
import { IncidentsGateway } from '../infra/incidents.gateway';
import { IncidentRepository } from '../domain/repositories/incident.repository';
import { PrismaIncidentRepository } from '../infra/repositories/prisma-incident.repository';
import { CreateIncidentUseCase } from '../application/use-cases/create-incident.use-case';
import { CloseIncidentUseCase } from '../application/use-cases/close-incident.use-case';
import { IncidentsQuery } from '../application/queries/incidents.query';

@Module({
  controllers: [IncidentsController],
  providers: [
    PrismaClient,
    IncidentsGateway,
    { provide: IncidentRepository, useClass: PrismaIncidentRepository },
    CreateIncidentUseCase,
    CloseIncidentUseCase,
    IncidentsQuery,
  ],
  exports: [IncidentRepository, IncidentsGateway, IncidentsQuery], 
})
export class IncidentsModule {}
