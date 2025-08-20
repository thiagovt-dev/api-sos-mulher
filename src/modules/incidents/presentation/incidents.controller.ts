import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { IsLatitude, IsLongitude, IsOptional, IsString } from 'class-validator';
import { CreateIncidentUseCase } from '../application/use-cases/create-incident.use-case';
import { PrismaIncidentRepository } from '../infra/repositories/prisma-incident.repository';
import { JwtAuthGuard } from '@/modules/auth/infra/guard/jwt.guard';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';

class CreateIncidentDto {
  @ApiProperty({ example: -23.55052, description: 'Latitude do local do incidente' })
  @IsLatitude()
  lat!: number;

  @ApiProperty({ example: -46.633308, description: 'Longitude do local do incidente' })
  @IsLongitude()
  lng!: number;

  @ApiProperty({ example: 'Av. Paulista, 1000 - São Paulo/SP', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'Vítima solicitando apoio', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

@ApiTags('Incidents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('incidents')
export class IncidentsController {
  constructor(
    private readonly createIncident: CreateIncidentUseCase,
    private readonly repo: PrismaIncidentRepository,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar incidente' })
  @ApiBody({
    type: CreateIncidentDto,
    examples: {
      default: {
        value: {
          lat: -23.55052,
          lng: -46.633308,
          address: 'Av. Paulista, 1000 - São Paulo/SP',
          description: 'Vítima solicitando apoio',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Incidente criado',
    schema: {
      example: {
        id: 'c1f20143-1f7d-4a8b-908f-3f0f6efb0f9a',
        code: 'INC-1A2B3C',
        lat: -23.55052,
        lng: -46.633308,
        address: 'Av. Paulista, 1000 - São Paulo/SP',
        description: 'Vítima solicitando apoio',
        status: 'OPEN',
        createdAt: '2024-08-20T12:34:56.000Z',
        updatedAt: '2024-08-20T12:34:56.000Z',
      },
    },
  })
  create(@Body() dto: CreateIncidentDto) {
    return this.createIncident.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar incidentes em aberto' })
  @ApiOkResponse({
    description: 'Lista de incidentes',
    schema: {
      type: 'array',
      items: {
        example: {
          id: 'c1f20143-1f7d-4a8b-908f-3f0f6efb0f9a',
          code: 'INC-1A2B3C',
          lat: -23.55052,
          lng: -46.633308,
          address: 'Av. Paulista, 1000 - São Paulo/SP',
          description: 'Vítima solicitando apoio',
          status: 'OPEN',
          createdAt: '2024-08-20T12:34:56.000Z',
          updatedAt: '2024-08-20T12:34:56.000Z',
          dispatches: [],
        },
      },
    },
  })
  list() {
    return this.repo.listOpen();
  }
}
