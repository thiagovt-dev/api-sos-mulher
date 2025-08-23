import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { PasswordHasher } from '@/shared/auth/domain/ports/password-hasher.port';
import { PASSWORD_HASHER } from '@/shared/auth/domain/ports/tokens';
import { AppRole } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';
import { CitizenRepository } from '../../domain/repositories/citizen.repository';

export type AdminCreateUserInput = {
  email?: string;
  username?: string; // p/ POLICE
  password?: string; // p/ ADMIN/CITIZEN
  roles: AppRole[]; // ['ADMIN'] | ['CITIZEN'] | ['POLICE'] ...
  name?: string;
  // perfil cidadão opcional
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
export class AdminCreateUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly citizen: CitizenRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher,
  ) {}

  async execute(input: AdminCreateUserInput) {
    if (!input.roles?.length) throw new BadRequestException('roles required');

    if (input.email) {
      const exists = await this.users.findByEmail(input.email);
      if (exists) throw new BadRequestException('email already in use');
    }

    const passwordHash = input.password ? await this.hasher.hash(input.password) : undefined;

    const user = await this.users.create({
      email: input.roles.includes("POLICE") ? "" : input.email as string,
      username: input.username ?? "",
      passwordHash: passwordHash as string,
      roles: input.roles,
    });

    if (input.roles.includes('CITIZEN') && input.phone) {
      await this.citizen.create({
        userId: user.id,
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

    return { userId: user.id, email: user.email, roles: user.roles };
  }
}
