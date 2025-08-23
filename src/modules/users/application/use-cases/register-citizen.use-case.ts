import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';
import type { PasswordHasher } from '@/shared/auth/domain/ports/password-hasher.port';
import type{ AuthTokenPort } from '@/shared/auth/domain/ports/auth-token.port';
import { CitizenRepository } from '../../domain/repositories/citizen.repository';
import { AUTH_TOKEN_PORT, PASSWORD_HASHER } from '@/shared/auth/domain/ports/tokens';


export type RegisterCitizenInput = {
  email: string;
  password: string;
  name?: string;
  // perfil opcional
  phone?: string;
  street?: string;
  number?: string;
  district?: string;
  city?: string;
  state?: string;
  zip?: string;
  lat?: number;
  lng?: number;
};

@Injectable()
export class RegisterCitizenUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly citizen: CitizenRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher,
    @Inject(AUTH_TOKEN_PORT) private readonly tokens: AuthTokenPort,
  ) {}

  async execute(input: RegisterCitizenInput) {
    const exists = await this.users.findByEmail(input.email);
    if (exists) throw new BadRequestException('email already in use');

    const passwordHash = await this.hasher.hash(input.password);
    const user = await this.users.create({
      email: input.email,
      passwordHash,
      roles: ['CITIZEN'],
    });

    if (input.phone) {
      await this.citizen.create({
        userId: user.id,
        name: input.name,
        phone: input.phone,
        street: input.street,
        number: input.number,
        district: input.district,
        city: input.city,
        state: input.state,
        zip: input.zip,
        lat: input.lat,
        lng: input.lng,
      });
    }

    return this.tokens.mint({ sub: user.id, roles: user.roles, email: user.email });
  }
}
