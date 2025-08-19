import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateUserDto } from '../application/dto/create-user.dto';
import { CreateUserUseCase } from '../application/use-cases/create-user.use-case';
import { UserRepository } from '../domain/repositories/user.repository';

@Controller('users')
export class UsersController {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly usersRepo: UserRepository,
  ) {}

  @Post()
  create(@Body() body: CreateUserDto) {
    return this.createUser.execute(body);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const user = await this.usersRepo.findById(id);
    if (!user) return null;
    return { id: user.id, email: user.email, name: user.name };
  }
}
