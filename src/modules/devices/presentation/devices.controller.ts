import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DevicePlatform } from '@prisma/client';
import { PrismaDeviceRepository } from '../infra/prisma-device.repository';

class RegisterDeviceDto {
  @IsString() token!: string;
  @IsEnum(DevicePlatform) platform!: DevicePlatform; 
  @IsOptional() @IsString() unitId?: string;
  @IsOptional() @IsString() userId?: string;
  @IsOptional() @IsString() deviceId?: string;
  @IsOptional() @IsString() appVersion?: string;
}

@Controller('devices')
export class DevicesController {
  constructor(private readonly repo: PrismaDeviceRepository) {}

  @Post('register')
  async register(@Body() dto: RegisterDeviceDto) {
    const d = await this.repo.registerOrUpdate(dto);
    return { id: d.id, token: d.token, platform: d.platform, unitId: d.unitId, userId: d.userId };
  }

  @Delete(':token')
  async deactivate(@Param('token') token: string) {
    await this.repo.deactivate(token);
    return { ok: true };
  }
}
