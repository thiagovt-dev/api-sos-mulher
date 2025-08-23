export interface AuthTokenPort {
  mint(payload: {
    sub: string;
    roles: string[];
    email?: string | null;
  }): Promise<{ access_token: string }>;
}
