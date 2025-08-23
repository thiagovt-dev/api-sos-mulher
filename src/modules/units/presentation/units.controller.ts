import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { IsOptional, IsString, IsLatitude, IsLongitude } from 'class-validator';
import { PrismaUnitRepository } from '../infra/repositories/prisma-units.repository';
import { JwtAuthGuard } from '@/modules/auth/infra/guard/jwt.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { AdminCreateUnitUseCase } from '../application/use-cases/admin-create-unit.use-case';
import { Roles } from '@/shared/auth/roles.decorator';
import { AdminUpdateUnitUseCase } from '../application/use-cases/admin-update-unit.use-case';
import { AdminResetUnitPinUseCase } from '../application/use-cases/admin-reset-unit-pin.use-case';

class CreateUnitDto {
  @ApiProperty({ example: 'Viatura Alfa', description: 'Nome da unidade' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'ABC-1234', required: false, description: 'Placa do veículo, se houver' })
  @IsOptional()
  @IsString()
  plate?: string;

  @ApiProperty({
    example: 'fcm_token_viatura',
    required: false,
    description: 'Token de push da viatura',
  })
  @IsOptional()
  @IsString()
  fcmToken?: string;

  @ApiProperty({ example: -23.558, required: false, description: 'Latitude inicial' })
  @IsOptional()
  @IsLatitude()
  lat?: number;

  @ApiProperty({ example: -46.66, required: false, description: 'Longitude inicial' })
  @IsOptional()
  @IsLongitude()
  lng?: number;

  @ApiProperty({
    example: 'gcm01',
    required: false,
    description: 'Username para login da viatura (polícia)'
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({
    example: '654321',
    required: false,
    description: 'PIN numérico para login da viatura (será hasheado)'
  })
  @IsOptional()
  @IsString()
  pin?: string;
}

class UpdateTokenDto {
  @ApiProperty({ example: 'novo_token_fcm', description: 'Novo token FCM da unidade' })
  @IsString()
  token!: string;
}

class UpdateUnitDto {
  name?: string;
  plate?: string;
  active?: boolean;
}


@ApiTags('Units')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('units')
export class UnitsController {
  constructor(
    private readonly repo: PrismaUnitRepository,
    private readonly createUnit: AdminCreateUnitUseCase,
    private readonly updateUnit: AdminUpdateUnitUseCase,
    private readonly resetPin: AdminResetUnitPinUseCase,
  ) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Criar unidade (viatura)' })
  @ApiBody({
    type: CreateUnitDto,
    examples: {
      default: {
        value: {
          name: 'Viatura Alfa',
          plate: 'ABC-1234',
          fcmToken: 'fcm_token_viatura',
          lat: -23.558,
          lng: -46.66,
          username: 'gcm01',
          pin: '654321',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Unidade criada',
    schema: {
      example: {
        id: 'aaaa1111-bbbb-2222-cccc-3333dddd4444',
        name: 'Viatura Alfa',
        plate: 'ABC-1234',
        active: true,
        fcmToken: 'fcm_token_viatura',
        lastLat: -23.558,
        lastLng: -46.66,
        createdAt: '2024-08-20T12:34:56.000Z',
        updatedAt: '2024-08-20T12:34:56.000Z',
      },
    },
  })
  create(@Body() dto: CreateUnitDto) {
    return this.createUnit.execute(dto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Atualizar dados da unidade' })
  @ApiParam({ name: 'id', description: 'ID da unidade (UUID do usuário POLICE)' })
  @ApiBody({
    type: UpdateUnitDto,
    examples: {
      default: { value: { name: 'Viatura Bravo', plate: 'ABC-5678', active: true } },
    },
  })
  @ApiOkResponse({ description: 'Unidade atualizada' })
  update(@Param('id') id: string, @Body() dto: UpdateUnitDto) {
    return this.updateUnit.execute(id, dto);
  }

  @Post(':id/reset-pin')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Redefinir PIN da unidade (gera novo PIN)' })
  @ApiParam({ name: 'id', description: 'ID da unidade (UUID do usuário POLICE)' })
  @ApiOkResponse({ description: 'PIN redefinido', schema: { example: { unitId: '...', pin: '123456' } } })
  reset(@Param('id') id: string) {
    return this.resetPin.execute(id);
  }

  @Get()
  @Roles('POLICE', 'ADMIN')
  @ApiOperation({ summary: 'Listar unidades ativas' })
  @ApiOkResponse({
    description: 'Lista de unidades',
    schema: {
      type: 'array',
      items: {
        example: {
          id: 'aaaa1111-bbbb-2222-cccc-3333dddd4444',
          name: 'Viatura Alfa',
          plate: 'ABC-1234',
          active: true,
          fcmToken: 'fcm_token_viatura',
          lastLat: -23.558,
          lastLng: -46.66,
          createdAt: '2024-08-20T12:34:56.000Z',
          updatedAt: '2024-08-20T12:34:56.000Z',
        },
      },
    },
  })
  list() {
    return this.repo.listActive();
  }

  @Patch(':id/token')
  @Roles('POLICE', 'ADMIN')
  @ApiOperation({ summary: 'Atualizar token FCM da unidade' })
  @ApiParam({
    name: 'id',
    description: 'ID da unidade',
    example: 'aaaa1111-bbbb-2222-cccc-3333dddd4444',
  })
  @ApiBody({ type: UpdateTokenDto, examples: { default: { value: { token: 'novo_token_fcm' } } } })
  @ApiOkResponse({
    description: 'Unidade atualizada',
    schema: {
      example: {
        id: 'aaaa1111-bbbb-2222-cccc-3333dddd4444',
        name: 'Viatura Alfa',
        plate: 'ABC-1234',
        active: true,
        fcmToken: 'novo_token_fcm',
        lastLat: -23.558,
        lastLng: -46.66,
        createdAt: '2024-08-20T12:34:56.000Z',
        updatedAt: '2024-08-20T12:40:00.000Z',
      },
    },
  })
  updateToken(@Param('id') id: string, @Body() dto: UpdateTokenDto) {
    return this.repo.updateToken(id, dto.token);
  }
}
