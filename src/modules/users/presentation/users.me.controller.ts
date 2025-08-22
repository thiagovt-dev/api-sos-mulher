// src/modules/users/users.me.controller.ts
import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { Roles } from '@/shared/auth/roles.decorator';
import { PrismaClient } from '@prisma/client';
import { JwtAuthGuard } from '@/modules/auth/infra/guard/jwt.guard';
import { UpdateMyCitizenProfileUseCase } from '../application/use-cases/update-citizen-profile.use-case';
import { UpdateCitizenProfileDto } from '../application/dto/update-citizen-profile.dto';
import { CurrentUser } from '@/shared/auth/current-user.decorator';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';


@UseGuards(JwtAuthGuard)
@Roles('CITIZEN', 'ADMIN')
@ApiBearerAuth()
@ApiTags('Me')
@Controller('me')
export class UsersMeController {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly updateProfile: UpdateMyCitizenProfileUseCase,
  ) {}

  @Get('profile')
  @ApiOperation({ summary: 'Obter meu perfil (cidadão)' })
  @ApiOkResponse({ description: 'Perfil do cidadão', schema: { example: { userId: '...', phone: '+55...', city: 'São Paulo' } } })
  async getProfile(@CurrentUser() user: any) {
    return this.prisma.citizenProfile.findUnique({ where: { userId: user.sub } });
  }

  @Put('profile')
  @ApiOperation({ summary: 'Atualizar meu perfil (cidadão)' })
  @ApiBody({
    type: UpdateCitizenProfileDto,
    examples: { default: { value: { phone: '+55 11 99999-0000', city: 'São Paulo', state: 'SP' } } },
  })
  @ApiOkResponse({ description: 'Perfil atualizado' })
  async update(@CurrentUser() user: any, @Body() dto: UpdateCitizenProfileDto) {
    return this.updateProfile.execute(user.sub, dto);
  }
}
