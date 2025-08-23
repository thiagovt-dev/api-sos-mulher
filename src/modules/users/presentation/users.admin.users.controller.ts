import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/infra/guard/jwt.guard';
import { Roles } from '@/shared/auth/roles.decorator';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ListAllUsersUseCase } from '../application/use-cases/list-all-users.use-case';

@UseGuards(JwtAuthGuard)
@Roles('ADMIN')
@ApiBearerAuth()
@ApiTags('Admin - Users')
@Controller('admin/users')
export class UsersAdminUsersController {
  constructor(private readonly listAll: ListAllUsersUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os usuários (ADMIN)' })
  @ApiOkResponse({
    description: 'Lista de usuários (campos básicos)',
    schema: {
      example: [
        { id: '...', email: 'user@example.com', createdAt: '2024-08-20T12:00:00.000Z' },
      ],
    },
  })
  list() {
    return this.listAll.execute();
  }
}
