import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { IsString } from 'class-validator';
import { CreateDispatchUseCase } from '../application/use-cases/create-dispatch.use-case';
import { JwtAuthGuard } from '@/modules/auth/infra/guard/jwt.guard';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';

class CreateDispatchDto {
  @ApiProperty({ example: 'c1f20143-1f7d-4a8b-908f-3f0f6efb0f9a', description: 'ID do incidente' })
  @IsString()
  incidentId!: string;

  @ApiProperty({
    example: 'a9b8c7d6-5e4f-3a2b-1c0d-9e8f7a6b5c4d',
    description: 'ID da unidade (viatura)',
  })
  @IsString()
  unitId!: string;
}

@ApiTags('Dispatch')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('dispatch')
export class DispatchController {
  constructor(private readonly createDispatch: CreateDispatchUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Designar uma unidade para um incidente' })
  @ApiBody({
    type: CreateDispatchDto,
    examples: {
      default: {
        value: {
          incidentId: 'c1f20143-1f7d-4a8b-908f-3f0f6efb0f9a',
          unitId: 'a9b8c7d6-5e4f-3a2b-1c0d-9e8f7a6b5c4d',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Despacho criado',
    schema: {
      example: {
        id: 'd1112222-3333-4444-5555-666677778888',
        incidentId: 'c1f20143-1f7d-4a8b-908f-3f0f6efb0f9a',
        unitId: 'a9b8c7d6-5e4f-3a2b-1c0d-9e8f7a6b5c4d',
        status: 'PENDING',
        notifiedAt: null,
        acceptedAt: null,
        createdAt: '2024-08-20T12:34:56.000Z',
        updatedAt: '2024-08-20T12:34:56.000Z',
      },
    },
  })
  assign(@Body() dto: CreateDispatchDto) {
    return this.createDispatch.execute(dto);
  }
}
