import { UniqueEntityID } from '@/core/unique-entity-id';
import { Family } from '../domain/family.domain';
import { FamilyDatabaseInterface } from '../repositories/family.repo.interface';

export interface FamilyPresenter {
  id: string;
  name: string;
  birthDate: Date;
  document: string;
  fatherId: string | null;
  motherId: string | null;

  father?: FamilyPresenter;
  mother?: FamilyPresenter;
  children?: FamilyPresenter[] | null;
}

export class FamilyMapper {
  static domainToPersistence(family: Family): FamilyDatabaseInterface {
    return {
      id: family.getId().toValue(),
      name: family.getName(),
      birthDate: family.getBirthDate(),
      document: family.getDocument(),
      fatherId: family.getFatherId()?.toValue() ?? null,
      motherId: family.getMotherId()?.toValue() ?? null,
    };
  }

  static persistenceToDomain(familyData: FamilyDatabaseInterface): Family {
    return new Family(
      {
        name: familyData.name,
        birthDate: familyData.birthDate,
        document: familyData.document,
        fatherId: familyData.fatherId
          ? new UniqueEntityID(familyData.fatherId)
          : null,
        motherId: familyData.motherId
          ? new UniqueEntityID(familyData.motherId)
          : null,
      },
      new UniqueEntityID(familyData.id),
    );
  }

  static domainToPresenter(family: Family): FamilyPresenter {
    return {
      id: family.getId().toValue(),
      name: family.getName(),
      birthDate: family.getBirthDate(),
      document: family.getDocument(),
      fatherId: family.getFatherId()?.toValue() ?? null,
      motherId: family.getMotherId()?.toValue() ?? null,
      father: family.getFather()
        ? FamilyMapper.domainToPresenter(family.getFather()!)
        : undefined,
      mother: family.getMother()
        ? FamilyMapper.domainToPresenter(family.getMother()!)
        : undefined,
      children: family.getChildren()
        ? family
            .getChildren()!
            .map((child) => FamilyMapper.domainToPresenter(child))
        : undefined,
    };
  }
}
