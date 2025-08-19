export class User {
  constructor(
    readonly id: string,
    readonly email: string,
    readonly name: string,
    readonly passwordHash: string,
    readonly createdAt: Date,
  ) {}
}
