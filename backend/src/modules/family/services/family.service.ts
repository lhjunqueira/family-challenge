import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UniqueEntityID } from '@/core/unique-entity-id';
import { Family } from '../domain/family.domain';
import {
  FAMILY_REPOSITORY,
  IFamilyRepository,
} from '../repositories/family.repository.interface';
import { CreateUpdateFamilyDto } from '../dtos/create-update-family.dto';
import { ListPaginated } from '../../../shared/types/list-paginated.class';
import { FamilyFilterPaginatedDto } from '../dtos/family-filter-paginated.dto';

@Injectable()
export class FamilyService {
  constructor(
    @Inject(FAMILY_REPOSITORY)
    private readonly familyRepository: IFamilyRepository,
  ) {}

  async findById(id: UniqueEntityID): Promise<Family> {
    const family = await this.familyRepository.findById(id);

    if (!family)
      throw new NotFoundException(`Family with ID ${id.toValue()} not found`);

    const fatherId = family.getFatherId();
    const father = fatherId
      ? await this.familyRepository.findById(fatherId)
      : null;
    if (father) family.setFather(father);

    const motherId = family.getMotherId();
    const mother = motherId
      ? await this.familyRepository.findById(motherId)
      : null;
    if (mother) family.setMother(mother);

    await this.familyRepository
      .findDescendants(id)
      .then((descendants) => family.setChildren(descendants));

    return family;
  }

  async findPaginated(
    params?: FamilyFilterPaginatedDto,
  ): Promise<ListPaginated<Family>> {
    const families = await this.familyRepository.findPaginated(params);
    return families;
  }

  async create(payload: CreateUpdateFamilyDto): Promise<Family> {
    const family = new Family({
      name: payload.name,
      birthDate: payload.birthDate,
      document: payload.document,
      fatherId: payload.fatherId ? new UniqueEntityID(payload.fatherId) : null,
      motherId: payload.motherId ? new UniqueEntityID(payload.motherId) : null,
    });

    await this.validateFatherAndMotherExistence(family);

    return this.familyRepository.persist(family);
  }

  async update(
    id: UniqueEntityID,
    payload: CreateUpdateFamilyDto,
  ): Promise<Family> {
    const family = await this.findById(id);

    family.update({
      name: payload.name,
      birthDate: payload.birthDate,
      document: payload.document,
      fatherId: payload.fatherId ? new UniqueEntityID(payload.fatherId) : null,
      motherId: payload.motherId ? new UniqueEntityID(payload.motherId) : null,
    });

    await this.validateFatherAndMotherExistence(family);

    return this.familyRepository.persist(family);
  }

  private async validateFatherAndMotherExistence(
    family: Family,
  ): Promise<void> {
    const fatherId = family.getFatherId();
    const motherId = family.getMotherId();

    return Promise.all([
      fatherId
        ? this.familyRepository.findById(fatherId)
        : Promise.resolve(null),
      motherId
        ? this.familyRepository.findById(motherId)
        : Promise.resolve(null),
    ]).then(([father, mother]) => {
      if (fatherId && !father)
        throw new NotFoundException(
          `Father with ID ${fatherId.toValue()} not found`,
        );

      if (motherId && !mother)
        throw new NotFoundException(
          `Mother with ID ${motherId.toValue()} not found`,
        );
    });
  }

  async delete(id: UniqueEntityID): Promise<void> {
    const family = await this.findById(id);

    if (!family)
      throw new NotFoundException(`Family with ID ${id.toValue()} not found`);

    await this.familyRepository.delete(id);
  }
}
