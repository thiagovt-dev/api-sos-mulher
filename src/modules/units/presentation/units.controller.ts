import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { IsOptional, IsString, IsLatitude, IsLongitude } from 'class-validator';
import { PrismaUnitRepository } from '../infra/repositories/prisma-units.repository';

class CreateUnitDto {
  @IsString() name!: string;
  @IsOptional() @IsString() plate?: string;
  @IsOptional() @IsString() fcmToken?: string;
  @IsOptional() @IsLatitude() lat?: number;
  @IsOptional() @IsLongitude() lng?: number;
}

class UpdateTokenDto {
  @IsString() token!: string;
}

@Controller('units')
export class UnitsController {
  constructor(private readonly repo: PrismaUnitRepository) {}

  @Post()
  create(@Body() dto: CreateUnitDto) {
    return this.repo.create(dto);
  }

  @Get()
  list() {
    return this.repo.listActive();
  }

  @Patch(':id/token')
  updateToken(@Param('id') id: string, @Body() dto: UpdateTokenDto) {
    return this.repo.updateToken(id, dto.token);
  }
}
