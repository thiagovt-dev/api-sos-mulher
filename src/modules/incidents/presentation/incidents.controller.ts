import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { IsLatitude, IsLongitude, IsOptional, IsString } from 'class-validator';
import { CreateIncidentUseCase } from '../application/use-cases/create-incident.use-case';
import { PrismaIncidentRepository } from '../infra/repositories/prisma-incident.repository';
import { JwtAuthGuard } from '@/modules/auth/infra/guard/jwt.guard';

class CreateIncidentDto {
  @IsLatitude() lat!: number;
  @IsLongitude() lng!: number;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() description?: string;
}

// @UseGuards(JwtAuthGuard)
@Controller('incidents')
export class IncidentsController {
  constructor(
    private readonly createIncident: CreateIncidentUseCase,
    private readonly repo: PrismaIncidentRepository,
  ) {}

  @Post()
  create(@Body() dto: CreateIncidentDto) {
    return this.createIncident.execute(dto);
  }

  @Get()
  list() {
    return this.repo.listOpen();
  }
}
