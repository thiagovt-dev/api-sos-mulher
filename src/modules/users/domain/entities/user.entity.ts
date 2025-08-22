export class User {
  constructor(
    readonly id: string,
    readonly email: string | null,
    readonly username: string | null,
    readonly passwordHash: string | null,
    readonly roles: ('CITIZEN' | 'POLICE' | 'ADMIN')[],
    readonly createdAt: Date,
  ) {}
}
