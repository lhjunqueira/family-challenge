import { Injectable } from '@nestjs/common';
import { UniqueEntityID } from '../../../core/unique-entity-id';
import { Family } from '../domain/family.domain';
import { FamilyMapper } from '../mappers/family.mapper';
import { FamilyDatabaseInterface } from './family.repo.interface';
import { FAMILY_MOCK } from '../mocks/family.mock';
import { ListPaginated } from '../../../shared/types/list-paginated.class';
import { FamilyFilterPaginatedDto } from '../dtos/family-filter-paginated.dto';
import { IFamilyRepository } from './family.repository.interface';
import { normalizeBasic } from '@/shared/utils/normalize';

@Injectable()
export class FamilyRepository implements IFamilyRepository {
  private families: FamilyDatabaseInterface[] = [...FAMILY_MOCK];

  private insert(family: FamilyDatabaseInterface): void {
    this.families.unshift(family);
  }

  private removeCascade(id: string): void {
    for (const family of this.families) {
      if (family.fatherId === id) family.fatherId = null;
      if (family.motherId === id) family.motherId = null;
    }
    this.families = this.families.filter((family) => family.id !== id);
  }

  private findRaw(id: string): FamilyDatabaseInterface | undefined {
    return this.families.find((family) => family.id === id);
  }

  private findAllRaw(): FamilyDatabaseInterface[] {
    return this.families;
  }

  private findByParentIdRaw(
    parentId: UniqueEntityID,
  ): FamilyDatabaseInterface[] {
    const pid = parentId.toValue();
    return this.families.filter(
      (family) => family.fatherId === pid || family.motherId === pid,
    );
  }

  private updateRaw(
    family: FamilyDatabaseInterface,
  ): FamilyDatabaseInterface | null {
    const index = this.families.findIndex((f) => f.id === family.id);
    if (index !== -1) {
      this.families[index] = family;
      return family;
    }
    return null;
  }

  findById(id: UniqueEntityID): Promise<Family | null> {
    const familyData = this.findRaw(id.toValue());
    return Promise.resolve(
      familyData ? FamilyMapper.persistenceToDomain(familyData) : null,
    );
  }

  findPaginated(
    params?: FamilyFilterPaginatedDto,
  ): Promise<ListPaginated<Family>> {
    const families = this.findAllRaw();

    const search = normalizeBasic(params?.search ?? '');

    const page =
      typeof params?.page === 'number' && params.page >= 0 ? params.page : 0;
    const limit = params?.limit && params.limit > 0 ? params.limit : 10;

    let filtered = families;

    if (search) {
      filtered = filtered.filter((f) => {
        const name = normalizeBasic(f.name);
        const document = normalizeBasic(f.document);
        return name.includes(search) || document.includes(search);
      });
    }

    const total = filtered.length;
    const start = page * limit;
    const paginated = filtered.slice(start, start + limit);
    const mapped = paginated.map((f) => FamilyMapper.persistenceToDomain(f));

    return Promise.resolve(new ListPaginated(mapped, total));
  }

  findDescendants(id: UniqueEntityID): Promise<Family[]> {
    const families = this.findByParentIdRaw(id);
    return Promise.resolve(
      families.map((family) => FamilyMapper.persistenceToDomain(family)),
    );
  }

  persist(family: Family): Promise<Family> {
    family.assertValid();
    const existing = this.findRaw(family.getId().toValue());
    const persistence = FamilyMapper.domainToPersistence(family);
    if (existing) this.updateRaw(persistence);
    else this.insert(persistence);
    return Promise.resolve(family);
  }

  delete(familyId: UniqueEntityID): Promise<void> {
    this.removeCascade(familyId.toValue());
    return Promise.resolve();
  }
}
