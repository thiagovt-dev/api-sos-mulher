import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/infra/guard/jwt.guard';
import { Roles as RolesDec } from '@/shared/auth/roles.decorator';
import { CurrentUser } from '@/shared/auth/current-user.decorator';
import { RecordLocationUseCase } from '../application/use-cases/record-location.use-case';
import { LocationPingDto } from '../application/dto/location-ping.dto';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@RolesDec('POLICE', 'CITIZEN', 'ADMIN')
@ApiTags('Location')
@ApiBearerAuth()    
@Controller('location')
export class LocationController {
  constructor(private readonly recordUC: RecordLocationUseCase) {}

  @Post('ping')
  @ApiOperation({ summary: 'Registrar posição atual do usuário' })
  @ApiBody({ type: LocationPingDto, required: true })
  @ApiCreatedResponse({ description: 'Amostra criada', schema: { example: { id: 'uuid' } } })
  async ping(@CurrentUser() user: any, @Body() dto: LocationPingDto) {
    return this.recordUC.execute({
      userId: user.sub,
      roles: user.roles ?? [],
      lat: dto.lat,
      lng: dto.lng,
      accuracy: dto.accuracy,
      speed: dto.speed,
      heading: dto.heading,
      incidentId: dto.incidentId,
      source: dto.source ?? 'MOBILE',
      recordedAt: dto.recordedAt ? new Date(dto.recordedAt) : undefined,
    });
  }
}
