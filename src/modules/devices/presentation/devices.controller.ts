import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DevicePlatform } from '@prisma/client';
import { PrismaDeviceRepository } from '../infra/prisma-device.repository';
import { ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';

class RegisterDeviceDto {
  @ApiProperty({ example: 'fcm_token_abc123', description: 'Token FCM/APNS do dispositivo' })
  @IsString()
  token!: string;

  @ApiProperty({
    enum: DevicePlatform,
    example: 'ANDROID',
    description: 'Plataforma do dispositivo',
  })
  @IsEnum(DevicePlatform)
  platform!: DevicePlatform;

  @ApiProperty({
    example: 'a9b8c7d6-5e4f-3a2b-1c0d-9e8f7a6b5c4d',
    required: false,
    description: 'ID da unidade associada',
  })
  @IsOptional()
  @IsString()
  unitId?: string;

  @ApiProperty({
    example: 'b6f7c1d2-5a0e-4b21-9a3f-1e2d3c4b5a6f',
    required: false,
    description: 'ID do usuário associado',
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({
    example: 'device-12345',
    required: false,
    description: 'Identificador do dispositivo no sistema do app',
  })
  @IsOptional()
  @IsString()
  deviceId?: string;

  @ApiProperty({ example: '1.0.3', required: false, description: 'Versão do app instalada' })
  @IsOptional()
  @IsString()
  appVersion?: string;
}

@ApiTags('Devices')
@Controller('devices')
export class DevicesController {
  constructor(private readonly repo: PrismaDeviceRepository) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar/atualizar dispositivo' })
  @ApiBody({
    type: RegisterDeviceDto,
    examples: {
      android: {
        summary: 'Android',
        value: {
          token: 'fcm_token_abc123',
          platform: 'ANDROID',
          unitId: 'a9b8c7d6-5e4f-3a2b-1c0d-9e8f7a6b5c4d',
          deviceId: 'Pixel-7-Pro',
          appVersion: '1.2.0',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Dispositivo registrado/atualizado',
    schema: {
      example: {
        id: '11112222-3333-4444-5555-666677778888',
        token: 'fcm_token_abc123',
        platform: 'ANDROID',
        unitId: 'a9b8c7d6-5e4f-3a2b-1c0d-9e8f7a6b5c4d',
        userId: null,
      },
    },
  })
  async register(@Body() dto: RegisterDeviceDto) {
    const d = await this.repo.registerOrUpdate(dto);
    return { id: d.id, token: d.token, platform: d.platform, unitId: d.unitId, userId: d.userId };
  }

  @Delete(':token')
  @ApiOperation({ summary: 'Desativar dispositivo por token' })
  @ApiParam({
    name: 'token',
    example: 'fcm_token_abc123',
    description: 'Token de push do dispositivo',
  })
  @ApiOkResponse({ description: 'Confirmação de desativação', schema: { example: { ok: true } } })
  async deactivate(@Param('token') token: string) {
    await this.repo.deactivate(token);
    return { ok: true };
  }
}
