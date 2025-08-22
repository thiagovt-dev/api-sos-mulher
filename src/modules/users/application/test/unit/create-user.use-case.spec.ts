import { UserRepository } from 'src/modules/users/domain/repositories/user.repository';
import { CreateUserUseCase } from '../../use-cases/create-user.use-case';

class InMemoryUsersRepo implements UserRepository {
  private store = new Map<string, any>();
  async create(u: any) {
    this.store.set(u.id, u);
    return u; 
  }
  async findByEmail(email: string) {
    for (const u of this.store.values()) if (u.email === email) return u;
    return null;
  }
  async findById(id: string) {
    return this.store.get(id) ?? null;
  }
}

describe('CreateUserUseCase (unit)', () => {
  it('cria usuário novo', async () => {
    const repo = new InMemoryUsersRepo();
    const useCase = new CreateUserUseCase(repo as any);

    const out = await useCase.execute({ email: 'jane@sos.com', password: 'secret123' });

    expect(out).toHaveProperty('id');
    expect(out).toMatchObject({ email: 'jane@sos.com' });
  });

  it('recusa email duplicado', async () => {
    const repo = new InMemoryUsersRepo();
    const useCase = new CreateUserUseCase(repo as any);

    await useCase.execute({ email: 'dup@sos.com', password: 'x' });
    await expect(useCase.execute({ email: 'dup@sos.com', password: 'y' })).rejects.toThrow(/E-mail já cadastrado/i);
  });
});
