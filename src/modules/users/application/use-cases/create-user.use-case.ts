import { Injectable, BadRequestException } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class CreateUserUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(input: CreateUserDto) {
    const exists = await this.users.findByEmail(input.email);
    if (exists) throw new BadRequestException('E-mail já cadastrado');

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = new User(randomUUID(), input.email, input.name, passwordHash, new Date());
    await this.users.create(user);
    return { id: user.id, email: user.email, name: user.name };
  }
}
