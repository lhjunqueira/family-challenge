import { FamilyRepository } from './family.repository';
import { Family } from '../domain/family.domain';

const makeEntity = (
  overrides?: Partial<ConstructorParameters<typeof Family>[0]>,
) =>
  new Family({
    name: 'Repo Test',
    birthDate: new Date('1995-05-05T00:00:00.000Z'),
    document: 'repo-doc',
    fatherId: null,
    motherId: null,
    ...overrides,
  });

describe('FamilyRepository', () => {
  let repository: FamilyRepository;

  beforeEach(() => {
    repository = new FamilyRepository();
  });

  it('should persist and retrieve a family', async () => {
    const family = makeEntity();
    await repository.persist(family);
    const found = await repository.findById(family.getId());
    expect(found?.getDocument()).toBe('repo-doc');
  });

  it('should update existing family on second persist', async () => {
    const family = makeEntity();
    await repository.persist(family);
    family.update({ name: 'Updated' });
    await repository.persist(family);
    const found = await repository.findById(family.getId());
    expect(found?.getName()).toBe('Updated');
  });

  it('should delete and cascade parent references', async () => {
    const parent = makeEntity();
    await repository.persist(parent);
    const child = makeEntity({ fatherId: parent.getId() });
    await repository.persist(child);
    await repository.delete(parent.getId());
    const orphan = await repository.findById(child.getId());
    expect(orphan?.getFatherId()).toBeNull();
  });

  it('should paginate results with search', async () => {
    const items = await repository.findPaginated({
      search: 'silva',
      page: 0,
      limit: 5,
    });
    expect(items.items.length).toBeLessThanOrEqual(5);
    expect(items.total).toBeGreaterThan(0);
  });
});
