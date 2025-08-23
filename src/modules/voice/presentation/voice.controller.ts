import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { JoinIncidentRoomUseCase } from '../application/use-cases/join-incident-room.use-case';
import { JwtAuthGuard } from '@/modules/auth/infra/guard/jwt.guard';
import { CloseIncidentRoomUseCase } from '../application/use-cases/close-incident-room.use-case';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { Roles } from '@/shared/auth/roles.decorator';
import { CurrentUser } from '@/shared/auth/current-user.decorator';
import { LeaveIncidentRoomUseCase } from '../application/use-cases/leave-incident-room.use-case';

class JoinDto {
  @ApiProperty({ example: 'c1f20143-1f7d-4a8b-908f-3f0f6efb0f9a', description: 'ID do incidente' })
  @IsString() incidentId!: string;

  @ApiProperty({ example: 'UNIT', enum: ['UNIT', 'DISPATCHER', 'VICTIM'], description: 'Tipo de participante' })
  @IsEnum(['UNIT', 'DISPATCHER', 'VICTIM'] as const) participantType!:
    | 'UNIT'
    | 'DISPATCHER'
    | 'VICTIM';

  @ApiProperty({ example: 'b6f7c1d2-5a0e-4b21-9a3f-1e2d3c4b5a6f', required: false, description: 'ID do participante (para UNIT/DISPATCHER)' })
  @IsOptional() @IsString() participantId?: string;

  @ApiProperty({ example: 'PTT', enum: ['PTT', 'FULL', 'LISTEN'], description: 'Modo de participação' })
  @IsEnum(['PTT', 'FULL', 'LISTEN'] as const) mode!: 'PTT' | 'FULL' | 'LISTEN';

  @ApiProperty({ example: 'Viatura Alfa', required: false, description: 'Nome exibido na sala' })
  @IsOptional() @IsString() name?: string;
}

class CloseDto {
  @ApiProperty({ example: 'c1f20143-1f7d-4a8b-908f-3f0f6efb0f9a', description: 'ID do incidente' })
  @IsString()
  incidentId!: string;
}

class LeaveDto {
  @ApiProperty({ example: 'c1f20143-1f7d-4a8b-908f-3f0f6efb0f9a', description: 'ID do incidente' })
  @IsString()
  incidentId!: string;

  @ApiProperty({ example: 'Viatura Alfa', required: false, description: 'Nome exibido na sala' })
  @IsOptional()
  @IsString()
  name?: string;
}


@Controller('voice')
@UseGuards(JwtAuthGuard)
@Roles('POLICE', 'CITIZEN', 'ADMIN')
@ApiBearerAuth()
@ApiTags('Voice')
export class VoiceController {
  constructor(
    private readonly joinUC: JoinIncidentRoomUseCase,
    private readonly close: CloseIncidentRoomUseCase,
    private readonly leaveUC: LeaveIncidentRoomUseCase,
  ) {}

  @Post('join')
  @ApiOperation({ summary: 'Ingressar na sala de voz do incidente' })
  @ApiBody({
    type: JoinDto,
    examples: {
      unit_ptt: {
        summary: 'Unidade em PTT',
        value: {
          incidentId: 'c1f20143-1f7d-4a8b-908f-3f0f6efb0f9a',
          participantType: 'UNIT',
          participantId: 'unit-123',
          mode: 'PTT',
          name: 'Viatura Alfa',
        },
      },
      dispatcher_full: {
        summary: 'Despachante em FULL',
        value: {
          incidentId: 'c1f20143-1f7d-4a8b-908f-3f0f6efb0f9a',
          participantType: 'DISPATCHER',
          participantId: 'user-456',
          mode: 'FULL',
          name: 'Operadora Júlia',
        },
      },
      victim_listen: {
        summary: 'Vítima apenas escuta',
        value: {
          incidentId: 'c1f20143-1f7d-4a8b-908f-3f0f6efb0f9a',
          participantType: 'VICTIM',
          mode: 'LISTEN',
          name: 'Vítima',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Token emitido para acesso à sala',
    schema: {
      example: {
        url: 'wss://livekit.example.com',
        roomName: 'inc_INC-1A2B3C',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        identity: 'unit:unit-123',
        mode: 'PTT',
      },
    },
  })
  @Roles('POLICE', 'CITIZEN', 'ADMIN')
  join(
    @CurrentUser() user: any,
    @Body() dto: { incidentId: string; mode?: 'PTT' | 'FULL' | 'LISTEN'; name?: string },
  ) {
    return this.joinUC.execute({ sub: user.sub, roles: user.roles ?? [] }, dto);
  }

  @Post('close')
  @Roles('POLICE', 'CITIZEN', 'ADMIN')
  @ApiOperation({ summary: 'Encerrar sala de voz do incidente' })
  @ApiBody({
    type: CloseDto,
    examples: {
      default: {
        value: {
          incidentId: 'c1f20143-1f7d-4a8b-908f-3f0f6efb0f9a',
        },
      },
    },
  })
  @ApiOkResponse({ description: 'Sala encerrada', schema: { example: { ok: true } } })
  closeRoom(@Body() dto: CloseDto) {
    return this.close.execute(dto);
  }

  @Post('leave')
  @Roles('POLICE', 'CITIZEN', 'ADMIN')
  @ApiOperation({ summary: 'Sair da sala de voz do incidente' })
  @ApiBody({
    type: LeaveDto,
    examples: {
      default: {
        value: {
          incidentId: 'c1f20143-1f7d-4a8b-908f-3f0f6efb0f9a',
          name: 'Vítima',
        },
      },
    },
  })
  @ApiOkResponse({ description: 'Saída registrada', schema: { example: { ok: true } } })
  leave(@CurrentUser() user: any, @Body() dto: LeaveDto) {
    return this.leaveUC.execute({ sub: user.sub, roles: user.roles ?? [] }, dto);
  }
}
