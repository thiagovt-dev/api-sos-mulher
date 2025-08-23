import { UserRepository } from '@/modules/users/domain/repositories/user.repository';
import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { CreateUserUseCase } from '@/modules/users/application/use-cases/create-user.use-case';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly jwt: JwtService,
    private readonly createUser: CreateUserUseCase,
  ) {}

  async register(input: { email: string; password: string }) {
    const user = await this.createUser.execute({
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

    const payload = { sub: user.id, email: user.email, roles: user.roles };
    const access_token = await this.jwt.signAsync(payload);
    return { access_token, user: { id: user.id, email: user.email, roles: user.roles } };
  }
}
