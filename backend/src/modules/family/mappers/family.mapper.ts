import { UniqueEntityID } from '@/core/unique-entity-id';
import { FamilyDomain } from '../domain/family.domain';
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
  static domainToPersistence(family: FamilyDomain): FamilyDatabaseInterface {
    return {
      id: family.getId().toValue(),
      name: family.getName(),
      birthDate: family.getBirthDate(),
      document: family.getDocument(),
      fatherId: family.getFatherId()?.toValue() ?? null,
      motherId: family.getMotherId()?.toValue() ?? null,
    };
  }

  static persistenceToDomain(
    familyData: FamilyDatabaseInterface,
  ): FamilyDomain {
    return new FamilyDomain(
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

  static domainToPresenter(family: FamilyDomain): FamilyPresenter {
    return {
      id: family.getId().toValue(),
      name: family.getName(),
      birthDate: family.getBirthDate(),
      document: family.getDocument(),
      fatherId: family.getFatherId()?.toValue() ?? null,
      motherId: family.getMotherId()?.toValue() ?? null,
      father: family.getFather()?.toPresenter(),
      mother: family.getMother()?.toPresenter(),
      children: family.getChildren()?.map((child) => child.toPresenter()),
    };
  }
}
