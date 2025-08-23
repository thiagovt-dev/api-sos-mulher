export const APP_ROLES = ['CITIZEN', 'POLICE', 'ADMIN'] as const;

export type AppRole = (typeof APP_ROLES)[number]; 
export class User {
  constructor(
    readonly id: string,
    readonly email: string | null,
    readonly username: string | null,
    readonly passwordHash: string | null,
    readonly roles: AppRole[],
    readonly createdAt: Date,
  ) {}
}
