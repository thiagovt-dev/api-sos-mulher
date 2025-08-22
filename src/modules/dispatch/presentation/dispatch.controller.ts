import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { IsString } from 'class-validator';
import { CreateDispatchUseCase } from '../application/use-cases/create-dispatch.use-case';
import { JwtAuthGuard } from '@/modules/auth/infra/guard/jwt.guard';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { AcceptDispatchUseCase } from '../application/use-cases/accept-dispatch.use-case';
import { Roles } from '@/shared/auth/roles.decorator';

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
  constructor(
    private readonly createDispatch: CreateDispatchUseCase,
    private readonly acceptDispatch: AcceptDispatchUseCase,
  ) {}

  @Post()
  @Roles('POLICE', 'ADMIN')
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

  @Post(':id/accept')
  @Roles('POLICE', 'ADMIN')
  @ApiOperation({ summary: 'Aceitar o despacho de uma unidade para um incidente' })
  @ApiOkResponse({
    description: 'Despacho aceito',
    schema: {
      example: {
        id: 'd1112222-3333-4444-5555-666677778888',
        incidentId: 'c1f20143-1f7d-4a8b-908f-3f0f6efb0f9a',
        unitId: 'a9b8c7d6-5e4f-3a2b-1c0d-9e8f7a6b5c4d',
        status: 'ACCEPTED',
        notifiedAt: '2024-08-20T12:34:56.000Z',
        acceptedAt: '2024-08-20T12:35:56.000Z',
        createdAt: '2024-08-20T12:34:56.000Z',
        updatedAt: '2024-08-20T12:35:56.000Z',
      },
    },
  })
  accept(@Param('id') id: string) {
    return this.acceptDispatch.execute({ dispatchId: id });
  }
}
