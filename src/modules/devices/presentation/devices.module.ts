import { Module } from '@nestjs/common';
import { DevicesController } from './devices.controller';
import { PrismaClient } from '@prisma/client';
import { PrismaDeviceRepository } from '../infra/prisma-device.repository';

@Module({
  controllers: [DevicesController],
  providers: [PrismaClient, PrismaDeviceRepository],
  exports: [PrismaDeviceRepository],
})
export class DevicesModule {}
