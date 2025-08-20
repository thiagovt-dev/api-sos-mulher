import { JwtStrategy } from "../../strategies/jwt.strategy";

describe('JwtStrategy (unit)', () => {
  it('validate: retorna { userId, email }', async () => {
    process.env.JWT_SECRET = 'test_secret';
    const strat = new JwtStrategy();
    const out = await strat.validate({ sub: 'u1', email: 'd@e.com' });
    expect(out).toEqual({ userId: 'u1', email: 'd@e.com' });
  });
});
