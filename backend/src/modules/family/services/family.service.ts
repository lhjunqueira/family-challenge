import { Injectable, NotFoundException } from '@nestjs/common';
import { UniqueEntityID } from '@/core/unique-entity-id';
import { FamilyDomain } from '../domain/family.domain';
import { FamilyRepository } from '../repositories/family.repository';
import { CreateUpdateFamilyDto } from '../dtos/create-update-family.dto';

@Injectable()
export class FamilyService {
  constructor(private readonly familyRepository: FamilyRepository) {}

  async findById(id: UniqueEntityID): Promise<FamilyDomain> {
    const family = await this.familyRepository.findById(id);

    if (!family)
      throw new NotFoundException(`Family with ID ${id.toValue()} not found`);

    await this.familyRepository
      .findDescendants(id)
      .then((descendants) => family.setChildren(descendants));

    return family;
  }

  async findAll(): Promise<FamilyDomain[]> {
    const families = await this.familyRepository.findAll();
    return families;
  }

  async create(payload: CreateUpdateFamilyDto): Promise<FamilyDomain> {
    const family = new FamilyDomain({
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
  ): Promise<FamilyDomain> {
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
    family: FamilyDomain,
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
