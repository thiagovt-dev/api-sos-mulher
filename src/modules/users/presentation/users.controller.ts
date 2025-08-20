import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UserRepository } from '../domain/repositories/user.repository';
import { JwtAuthGuard } from '@/modules/auth/infra/guard/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersRepo: UserRepository,
  ) {}

  @Get(':id')
  async getById(@Param('id') id: string) {
    const user = await this.usersRepo.findById(id);
    if (!user) return null;
    return { id: user.id, email: user.email, name: user.name };
  }
}
