import { JwtStrategy } from "../../strategies/jwt.strategy";

describe('JwtStrategy (unit)', () => {
  it('validate: retorna { sub, email, roles }', async () => {
    process.env.JWT_SECRET = 'test_secret';
    const strat = new JwtStrategy();
    const out = await strat.validate({ sub: 'u1', email: 'd@e.com' } as any);
    expect(out).toEqual({ sub: 'u1', email: 'd@e.com', roles: [] });
  });
});
