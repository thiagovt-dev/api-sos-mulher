import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UserRepository } from '../domain/repositories/user.repository';
import { JwtAuthGuard } from '@/modules/auth/infra/guard/jwt.guard';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersRepo: UserRepository,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  @ApiParam({ name: 'id', required: true, description: 'UUID do usuário', example: 'b6f7c1d2-5a0e-4b21-9a3f-1e2d3c4b5a6f' })
  @ApiOkResponse({
    description: 'Usuário encontrado (ou null se não encontrado)',
    schema: {
      example: { id: 'b6f7c1d2-5a0e-4b21-9a3f-1e2d3c4b5a6f', email: 'maria@example.com', name: 'Maria Silva' },
    },
  })
  async getById(@Param('id') id: string) {
    const user = await this.usersRepo.findById(id);
    if (!user) return null;
    return { id: user.id, email: user.email, name: user.name };
  }
}
