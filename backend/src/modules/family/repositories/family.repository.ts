import { Injectable } from '@nestjs/common';
import { UniqueEntityID } from '../../../core/unique-entity-id';
import { FamilyDomain } from '../domain/family.domain';
import { FamilyMapper } from '../mappers/family.mapper';
import { FamilyDatabaseInterface } from './family.repo.interface';
import { FAMILY_MOCK } from '../mocks/family.mock';

class FamilyInMemoryDatabase {
  private families: FamilyDatabaseInterface[] = [];
  private mappedFamilies: Map<string, FamilyDatabaseInterface> = new Map();

  constructor() {
    this.families = FAMILY_MOCK;
    this.updateMapper();
  }

  updateMapper() {
    this.mappedFamilies = new Map(
      this.families.map((family) => [family.id, family]),
    );
  }

  insert(family: FamilyDatabaseInterface) {
    this.families.unshift(family);
    this.mappedFamilies.set(family.id, family);
  }

  remove(familyId: UniqueEntityID): Promise<void> {
    const id = familyId.toValue();

    for (const family of this.families) {
      if (family.fatherId === id) family.fatherId = null;
      if (family.motherId === id) family.motherId = null;
    }

    this.families = this.families.filter((family) => family.id !== id);
    this.updateMapper();

    return Promise.resolve();
  }

  find(id: string): Promise<FamilyDatabaseInterface | undefined> {
    return Promise.resolve(this.mappedFamilies.get(id));
  }

  findAll(): Promise<FamilyDatabaseInterface[]> {
    return Promise.resolve(this.families);
  }

  findByParentId(parentId: UniqueEntityID): Promise<FamilyDatabaseInterface[]> {
    return Promise.resolve(
      this.families.filter(
        (family) =>
          family.fatherId === parentId.toValue() ||
          family.motherId === parentId.toValue(),
      ),
    );
  }

  update(
    family: FamilyDatabaseInterface,
  ): Promise<FamilyDatabaseInterface | null> {
    const index = this.families.findIndex((f) => f.id === family.id);

    if (index !== -1) {
      this.families[index] = family;
      this.mappedFamilies.set(family.id, family);
      return Promise.resolve(family);
    }

    return Promise.resolve(null);
  }
}

@Injectable()
export class FamilyRepository {
  private _families = new FamilyInMemoryDatabase();

  async findById(id: UniqueEntityID): Promise<FamilyDomain | null> {
    return this._families
      .find(id.toValue())
      .then((familyData) =>
        familyData ? FamilyMapper.persistenceToDomain(familyData) : null,
      );
  }

  async findAll(): Promise<FamilyDomain[]> {
    return this._families
      .findAll()
      .then((families) =>
        families.map((family) => FamilyMapper.persistenceToDomain(family)),
      );
  }

  async findDescendants(id: UniqueEntityID): Promise<FamilyDomain[]> {
    return this._families
      .findByParentId(id)
      .then((families) =>
        families.map((family) => FamilyMapper.persistenceToDomain(family)),
      );
  }

  async persist(family: FamilyDomain): Promise<FamilyDomain> {
    family.assertValid();

    return this._families
      .find(family.getId().toValue())
      .then(async (existing) => {
        if (existing) await this._families.update(family.toPersistence());
        else this._families.insert(family.toPersistence());

        return Promise.resolve(family);
      });
  }

  async delete(familyId: UniqueEntityID): Promise<void> {
    await this._families.remove(familyId);
  }
}
