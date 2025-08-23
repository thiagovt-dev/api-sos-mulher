import { Injectable } from '@nestjs/common';
import { AppRole } from '../types/type';

@Injectable()
export class IdentityService {
  make(role: AppRole, userId: string, name?: string) {
    const identity = `${role.toLowerCase()}:${userId}`;
    const displayName =
      name ?? (role === 'POLICE' ? 'Unit' : role === 'ADMIN' ? 'Operator' : 'Citizen');
    return { identity, displayName };
  }
}
