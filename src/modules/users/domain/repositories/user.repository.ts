import { AppRole, User } from '../entities/user.entity';

export abstract class UserRepository {
  /**
   * Creates a user letting the database generate the UUID id.
   * Returns the persisted user entity.
   */
  abstract create(input: {
    email: string;
    passwordHash: string;
    roles?: AppRole[];
    username?: string | null;
  }): Promise<User>;

  abstract findByEmail(email: string): Promise<User | null>;
  abstract findById(id: string): Promise<User | null>;
}
