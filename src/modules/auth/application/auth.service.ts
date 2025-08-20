import { PrismaUserRepository } from '@/modules/users/infra/repositories/prisma-user.repository';
import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserUseCase } from '@/modules/users/application/use-cases/create-user.use-case';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: PrismaUserRepository,
    private readonly jwt: JwtService,
    private readonly createUser: CreateUserUseCase,
  ) {}

  async register(input: { name: string; email: string; password: string }) {
    const user = await this.createUser.execute({
      name: input.name,
      email: input.email,
      password: input.password,
    });
    return user;
  }

  async login(input: { email: string; password: string }) {
    const user = await this.users.findByEmail(input.email);
    if (!user || !user.passwordHash) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, email: user.email };
    const access_token = await this.jwt.signAsync(payload);
    return {
      access_token,
      user: { id: user.id, name: user.name, email: user.email },
    };
  }
}
