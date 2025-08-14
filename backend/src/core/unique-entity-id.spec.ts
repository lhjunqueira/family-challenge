import { UniqueEntityID } from './unique-entity-id';

describe('UniqueEntityID', () => {
  it('generates different ids when not provided', () => {
    const a = new UniqueEntityID();
    const b = new UniqueEntityID();
    expect(a.toValue()).not.toBe(b.toValue());
  });

  it('respects provided value', () => {
    const id = new UniqueEntityID('fixed');
    expect(id.toValue()).toBe('fixed');
  });

  it('equals compares underlying value', () => {
    const id1 = new UniqueEntityID('same');
    const id2 = new UniqueEntityID('same');
    expect(id1.equals(id2)).toBe(true);
  });
});
