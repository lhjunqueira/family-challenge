import { UniqueEntityID } from '@/core/unique-entity-id';
import { Family } from '../domain/family.domain';
import { ListPaginated } from '@/shared/types/list-paginated.class';
import { FamilyFilterPaginatedDto } from '../dtos/family-filter-paginated.dto';

export const FAMILY_REPOSITORY = Symbol('FAMILY_REPOSITORY');

export interface IFamilyRepository {
  findById(id: UniqueEntityID): Promise<Family | null>;
  findPaginated(
    params?: FamilyFilterPaginatedDto,
  ): Promise<ListPaginated<Family>>;
  findDescendants(id: UniqueEntityID): Promise<Family[]>;
  persist(family: Family): Promise<Family>;
  delete(familyId: UniqueEntityID): Promise<void>;
}
