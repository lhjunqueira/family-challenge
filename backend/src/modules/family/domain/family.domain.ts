import { BaseProps } from '@/core/base-props';
import { Entity } from '@/core/entity';
import { UniqueEntityID } from '@/core/unique-entity-id';
import {
  DomainValidationError,
  ValidationIssue,
  ValidationResult,
} from '@/core/domain-validation';
import { FamilyMapper } from '../mappers/family.mapper';

export interface FamilyProps extends BaseProps {
  name: string;
  birthDate: Date;
  document: string;
  fatherId: UniqueEntityID | null;
  motherId: UniqueEntityID | null;

  father?: FamilyDomain;
  mother?: FamilyDomain;
  children?: FamilyDomain[];
}

export class FamilyDomain extends Entity<FamilyProps> {
  private static isFamilyDomain(v: unknown): v is FamilyDomain {
    return v instanceof FamilyDomain;
  }

  getName = () => this.props.name;
  getBirthDate = () => this.props.birthDate;
  getDocument = () => this.props.document;
  getFatherId = () => this.props.fatherId;
  getMotherId = () => this.props.motherId;

  getFather = () => this.props.father;
  getMother = () => this.props.mother;
  getChildren = () => this.props.children;

  update({
    name,
    birthDate,
    document,
    fatherId,
    motherId,
  }: Partial<Omit<FamilyProps, 'father' | 'mother' | keyof BaseProps>>) {
    if (name) this.props.name = name;
    if (birthDate) this.props.birthDate = birthDate;
    if (document) this.props.document = document;
    if (fatherId) this.updateFather(fatherId);
    if (motherId) this.updateMother(motherId);

    return this;
  }

  updateFather(father: FamilyDomain | UniqueEntityID) {
    if (FamilyDomain.isFamilyDomain(father)) {
      const newId = father.getId();
      const idChanged = newId.toValue() !== this.props.fatherId?.toValue();
      const instanceChanged = this.props.father !== father;

      this.props.father = father;
      this.props.fatherId = newId;

      if (idChanged || instanceChanged) this.props.updatedAt = new Date();
    } else {
      const idChanged = father.toValue() !== this.props.fatherId?.toValue();
      this.props.fatherId = father;

      if (idChanged) {
        this.props.father = undefined;
        this.props.updatedAt = new Date();
      }
    }

    return this;
  }

  updateMother(mother: FamilyDomain | UniqueEntityID) {
    if (FamilyDomain.isFamilyDomain(mother)) {
      const newId = mother.getId();
      const idChanged = newId.toValue() !== this.props.motherId?.toValue();
      const instanceChanged = this.props.mother !== mother;

      this.props.mother = mother;
      this.props.motherId = newId;

      if (idChanged || instanceChanged) this.props.updatedAt = new Date();
    } else {
      const idChanged = mother.toValue() !== this.props.motherId?.toValue();
      this.props.motherId = mother;

      if (idChanged) {
        this.props.mother = undefined;
        this.props.updatedAt = new Date();
      }
    }

    return this;
  }

  setChildren(children: FamilyDomain[]) {
    this.props.children = children;
    return this;
  }

  validate(): boolean {
    return this.validateAll().ok;
  }

  validateAll(): ValidationResult {
    const issues: ValidationIssue[] = [];
    const now = new Date();
    const minBirth = new Date('1900-01-01T00:00:00Z');

    const isValidDate = (d: unknown): d is Date =>
      d instanceof Date && !Number.isNaN(d.getTime());

    if (
      typeof this.props.name !== 'string' ||
      this.props.name.trim().length < 2
    ) {
      issues.push({
        path: 'name',
        code: 'name.minLength',
        message: 'Nome deve ter ao menos 2 caracteres.',
      });
    }

    if (
      typeof this.props.name === 'string' &&
      this.props.name.trim().length > 120
    ) {
      issues.push({
        path: 'name',
        code: 'name.maxLength',
        message: 'Nome deve ter no máximo 120 caracteres.',
      });
    }

    if (
      typeof this.props.document !== 'string' ||
      this.props.document.trim().length === 0
    ) {
      issues.push({
        path: 'document',
        code: 'document.required',
        message: 'Documento é obrigatório.',
      });
    } else if (this.props.document.trim().length > 50) {
      issues.push({
        path: 'document',
        code: 'document.maxLength',
        message: 'Documento deve ter no máximo 50 caracteres.',
      });
    }

    console.log({
      birthDate: this.props.birthDate,
      valid: isValidDate(this.props.birthDate),
    });

    if (!isValidDate(this.props.birthDate)) {
      issues.push({
        path: 'birthDate',
        code: 'birthDate.invalid',
        message: 'Data de nascimento inválida.',
      });
    } else {
      if (this.props.birthDate < minBirth) {
        issues.push({
          path: 'birthDate',
          code: 'birthDate.tooEarly',
          message: 'Data de nascimento muito antiga.',
        });
      }

      if (this.props.birthDate > now) {
        issues.push({
          path: 'birthDate',
          code: 'birthDate.inFuture',
          message: 'Data de nascimento não pode ser no futuro.',
        });
      }
    }

    if (!isValidDate(this.props.createdAt) || this.props.createdAt > now) {
      issues.push({
        path: 'createdAt',
        code: 'createdAt.invalid',
        message: 'createdAt inválido.',
      });
    }

    if (
      !isValidDate(this.props.updatedAt) ||
      this.props.updatedAt < this.props.createdAt ||
      this.props.updatedAt > now
    ) {
      issues.push({
        path: 'updatedAt',
        code: 'updatedAt.invalid',
        message: 'updatedAt inválido.',
      });
    }

    const deletedAt = this.props.deletedAt;
    if (deletedAt !== null) {
      if (
        !isValidDate(deletedAt) ||
        deletedAt < this.props.createdAt ||
        deletedAt > now
      ) {
        issues.push({
          path: 'deletedAt',
          code: 'deletedAt.invalid',
          message: 'deletedAt inválido.',
        });
      }
    }

    const selfId = this.getId().toValue();
    const fatherIdVal = this.props.fatherId?.toValue();
    const motherIdVal = this.props.motherId?.toValue();

    if (fatherIdVal === selfId) {
      issues.push({
        path: 'fatherId',
        code: 'relation.selfParent',
        message: 'Pai não pode ser o próprio.',
      });
    }

    if (motherIdVal === selfId) {
      issues.push({
        path: 'motherId',
        code: 'relation.selfParent',
        message: 'Mãe não pode ser a própria.',
      });
    }

    if (fatherIdVal && motherIdVal && fatherIdVal === motherIdVal) {
      issues.push({
        path: 'fatherId|motherId',
        code: 'relation.parentsDistinct',
        message: 'Pai e mãe devem ser diferentes.',
      });
    }

    if (
      this.props.father &&
      this.props.father.getId().toValue() !== fatherIdVal
    ) {
      issues.push({
        path: 'father',
        code: 'relation.inconsistentId',
        message: 'Entidade pai não confere com fatherId.',
      });
    }

    if (
      this.props.mother &&
      this.props.mother.getId().toValue() !== motherIdVal
    ) {
      issues.push({
        path: 'mother',
        code: 'relation.inconsistentId',
        message: 'Entidade mãe não confere com motherId.',
      });
    }

    if (
      this.props.father &&
      (!isValidDate(this.props.father.getBirthDate()) ||
        this.props.father.getBirthDate() >= this.props.birthDate)
    ) {
      issues.push({
        path: 'father.birthDate',
        code: 'relation.birthOrder',
        message: 'Data de nascimento do pai deve ser anterior à do filho.',
      });
    }

    if (
      this.props.mother &&
      (!isValidDate(this.props.mother.getBirthDate()) ||
        this.props.mother.getBirthDate() >= this.props.birthDate)
    ) {
      issues.push({
        path: 'mother.birthDate',
        code: 'relation.birthOrder',
        message: 'Data de nascimento da mãe deve ser anterior à do filho.',
      });
    }

    return { ok: issues.length === 0, errors: issues };
  }

  assertValid(): this {
    const result = this.validateAll();

    if (!result.ok)
      throw new DomainValidationError(
        'Falha de validação em FamilyDomain',
        result.errors,
      );

    return this;
  }

  toPersistence() {
    return FamilyMapper.domainToPersistence(this);
  }

  toPresenter() {
    return FamilyMapper.domainToPresenter(this);
  }
}
