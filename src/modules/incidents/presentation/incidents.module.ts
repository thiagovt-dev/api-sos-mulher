import { Module } from '@nestjs/common';
import { IncidentsController } from './incidents.controller';
import { PrismaClient } from '@prisma/client';
import { PrismaIncidentRepository } from '../infra/repositories/prisma-incident.repository';
import { CreateIncidentUseCase } from '../application/use-cases/create-incident.use-case';
import { IncidentsGateway } from '../infra/incidents.gateway';

@Module({
  controllers: [IncidentsController],
  providers: [PrismaClient, PrismaIncidentRepository, CreateIncidentUseCase, IncidentsGateway],
  exports: [PrismaIncidentRepository, IncidentsGateway],
})
export class IncidentsModule {}
