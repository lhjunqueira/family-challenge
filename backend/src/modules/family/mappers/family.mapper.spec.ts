import { FamilyMapper } from './family.mapper';
import { Family } from '../domain/family.domain';
import { UniqueEntityID } from '@/core/unique-entity-id';

describe('FamilyMapper', () => {
  it('should map domain to persistence and back', () => {
    const id = new UniqueEntityID();
    const domain = new Family(
      {
        name: 'Mapper Test',
        birthDate: new Date('2001-01-01T00:00:00.000Z'),
        document: 'map-doc',
        fatherId: null,
        motherId: null,
      },
      id,
    );

    const persistence = FamilyMapper.domainToPersistence(domain);
    expect(persistence.id).toBe(id.toValue());

    const restored = FamilyMapper.persistenceToDomain(persistence);
    expect(restored.getName()).toBe('Mapper Test');
  });

  it('should map domain to presenter with relations', () => {
    const father = new Family({
      name: 'Father',
      birthDate: new Date('1980-01-01T00:00:00.000Z'),
      document: 'father-doc',
      fatherId: null,
      motherId: null,
    });
    const child = new Family({
      name: 'Child',
      birthDate: new Date('2010-01-01T00:00:00.000Z'),
      document: 'child-doc',
      fatherId: father.getId(),
      motherId: null,
    });
    child.setFather(father);
    const presenter = FamilyMapper.domainToPresenter(child);
    expect(presenter.father?.name).toBe('Father');
  });
});
