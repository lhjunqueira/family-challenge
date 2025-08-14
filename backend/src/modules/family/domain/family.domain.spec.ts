import { Family } from './family.domain';
import { UniqueEntityID } from '@/core/unique-entity-id';
import { DomainValidationError } from '@/core/domain-validation';

const makeValid = () =>
  new Family({
    name: 'John Doe',
    birthDate: new Date('1990-01-01T00:00:00.000Z'),
    document: '123',
    fatherId: null,
    motherId: null,
  });

describe('FamilyDomain.validateAll', () => {
  it('should be valid with correct props', () => {
    const family = makeValid();
    expect(family.validate()).toBe(true);
  });

  it('should collect issues for invalid name and document and birthDate future', () => {
    const family = new Family({
      name: 'A',
      birthDate: new Date(Date.now() + 60_000),
      document: '',
      fatherId: null,
      motherId: null,
    });
    const result = family.validateAll();
    expect(result.ok).toBe(false);
    expect(result.errors.map((e) => e.path)).toEqual(
      expect.arrayContaining(['name', 'document', 'birthDate']),
    );
  });

  it('should throw DomainValidationError on assertValid with issues', () => {
    const family = new Family({
      name: 'A',
      birthDate: new Date('1890-01-01T00:00:00.000Z'),
      document: '1',
      fatherId: null,
      motherId: null,
    });
    expect(() => family.assertValid()).toThrow(DomainValidationError);
  });

  it('should validate parent relations (self as father)', () => {
    const id = new UniqueEntityID();
    const family = new Family(
      {
        name: 'Valid Name',
        birthDate: new Date('2000-01-01T00:00:00.000Z'),
        document: 'doc',
        fatherId: id,
        motherId: null,
      },
      id,
    );
    const result = family.validateAll();
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.code === 'relation.selfParent')).toBe(
      true,
    );
  });

  it('should invalidate when fatherId and motherId are the same', () => {
    const same = new UniqueEntityID();
    const family = new Family({
      name: 'Child',
      birthDate: new Date('2010-01-01T00:00:00.000Z'),
      document: 'doc-child',
      fatherId: same,
      motherId: same,
    });
    const result = family.validateAll();
    expect(result.ok).toBe(false);
    expect(
      result.errors.some((e) => e.code === 'relation.parentsDistinct'),
    ).toBe(true);
  });

  it("should invalidate when mother's birth date is not before child's", () => {
    const mother = new Family({
      name: 'Mother',
      birthDate: new Date('2015-01-01T00:00:00.000Z'),
      document: 'doc-mom',
      fatherId: null,
      motherId: null,
    });
    const child = new Family({
      name: 'Child',
      birthDate: new Date('2015-01-01T00:00:00.000Z'),
      document: 'doc-child',
      fatherId: null,
      motherId: mother.getId(),
    });
    child.setMother(mother);
    const result = child.validateAll();
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.code === 'relation.birthOrder')).toBe(
      true,
    );
  });
});
