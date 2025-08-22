import { Body, Controller, Get, UseGuards, Post } from '@nestjs/common';
import { Roles } from '@/shared/auth/roles.decorator';
import { PrismaClient } from '@prisma/client';
import { JwtAuthGuard } from '@/modules/auth/infra/guard/jwt.guard';
import { AdminCreateCitizenUseCase } from '../application/use-cases/admin-create-citizen.use-case';
import { CreateCitizenDto } from '../application/dto/create-citizen.dto';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';


@UseGuards(JwtAuthGuard)
@Roles('ADMIN')
@ApiBearerAuth()
@ApiTags('Admin - Citizens')
@Controller('admin/citizens')
export class UsersAdminController {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly createCitizen: AdminCreateCitizenUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar cidadão (ADMIN)' })
  @ApiBody({
    type: CreateCitizenDto,
    examples: { default: { value: { email: 'user@example.com', password: 'secret123', phone: '+55 11 99999-0000' } } },
  })
  @ApiOkResponse({ description: 'Cidadão criado', schema: { example: { userId: '...', email: 'user@example.com' } } })
  create(@Body() dto: CreateCitizenDto) {
    return this.createCitizen.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar cidadãos (ADMIN)' })
  @ApiOkResponse({ description: 'Lista de cidadãos', schema: { example: [{ id: '...', email: 'user@example.com', createdAt: '2024-08-20T12:00:00.000Z' }] } })
  list() {
    return this.prisma.user.findMany({
      where: { roles: { has: 'CITIZEN' } },
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, createdAt: true },
    });
  }
}
