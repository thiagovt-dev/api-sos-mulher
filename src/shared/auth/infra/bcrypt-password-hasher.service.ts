import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import type { PasswordHasher } from '@/shared/auth/domain/ports/password-hasher.port';

@Injectable()
export class BcryptPasswordHasher implements PasswordHasher {
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, 10);
  }

  async verify(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}

