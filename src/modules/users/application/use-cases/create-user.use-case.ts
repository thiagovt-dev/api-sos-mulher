import { Injectable, BadRequestException } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class CreateUserUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(input: CreateUserDto) {
    const exists = await this.users.findByEmail(input.email);
    if (exists) throw new BadRequestException('E-mail já cadastrado');

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await this.users.create({
      email: input.email,
      passwordHash,
      roles: ['CITIZEN'],
    });
    return { id: user.id, email: user.email };
  }
}
