import { BaseProps } from '@/core/base-props';
import { Entity } from '@/core/entity';
import { UniqueEntityID } from '@/core/unique-entity-id';
import {
  DomainValidationError,
  ValidationIssue,
  ValidationResult,
} from '@/core/domain-validation';

export interface FamilyProps extends BaseProps {
  name: string;
  birthDate: Date;
  document: string;
  fatherId: UniqueEntityID | null;
  motherId: UniqueEntityID | null;

  father?: Family;
  mother?: Family;
  children?: Family[];
}

export class Family extends Entity<FamilyProps> {
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
    if (fatherId) this.props.fatherId = fatherId;
    if (motherId) this.props.motherId = motherId;

    return this;
  }

  setFather(father: Family) {
    this.props.father = father;
    return this;
  }

  setMother(mother: Family) {
    this.props.mother = mother;
    return this;
  }

  setChildren(children: Family[]) {
    this.props.children = children;
    return this;
  }

  validate(): boolean {
    return this.validateAll().ok;
  }

  validateAll(): ValidationResult {
    const issues: ValidationIssue[] = [];
    this.validateName(issues);
    this.validateDocument(issues);
    this.validateTemporalProps(issues);
    this.validateRelations(issues);
    return { ok: issues.length === 0, errors: issues };
  }

  private isValidDate(d: unknown): d is Date {
    return d instanceof Date && !Number.isNaN(d.getTime());
  }

  private validateName(issues: ValidationIssue[]) {
    if (
      typeof this.props.name !== 'string' ||
      this.props.name.trim().length < 2
    )
      issues.push({
        path: 'name',
        code: 'name.minLength',
        message: 'Name must have at least 2 characters.',
      });

    if (
      typeof this.props.name === 'string' &&
      this.props.name.trim().length > 120
    )
      issues.push({
        path: 'name',
        code: 'name.maxLength',
        message: 'Name must have at most 120 characters.',
      });
  }

  private validateDocument(issues: ValidationIssue[]) {
    if (
      typeof this.props.document !== 'string' ||
      this.props.document.trim().length === 0
    )
      issues.push({
        path: 'document',
        code: 'document.required',
        message: 'Document is required.',
      });
    else if (this.props.document.trim().length > 50)
      issues.push({
        path: 'document',
        code: 'document.maxLength',
        message: 'Document must have at most 50 characters.',
      });
  }

  private validateTemporalProps(issues: ValidationIssue[]) {
    const now = new Date();
    const minBirth = new Date('1900-01-01T00:00:00Z');

    if (!this.isValidDate(this.props.birthDate))
      issues.push({
        path: 'birthDate',
        code: 'birthDate.invalid',
        message: 'Birth date is invalid.',
      });
    else {
      if (this.props.birthDate < minBirth)
        issues.push({
          path: 'birthDate',
          code: 'birthDate.tooEarly',
          message: 'Birth date is too early.',
        });
      if (this.props.birthDate > now)
        issues.push({
          path: 'birthDate',
          code: 'birthDate.inFuture',
          message: 'Birth date cannot be in the future.',
        });
    }

    if (!this.isValidDate(this.props.createdAt) || this.props.createdAt > now)
      issues.push({
        path: 'createdAt',
        code: 'createdAt.invalid',
        message: 'createdAt is invalid.',
      });

    if (
      !this.isValidDate(this.props.updatedAt) ||
      this.props.updatedAt < this.props.createdAt ||
      this.props.updatedAt > now
    )
      issues.push({
        path: 'updatedAt',
        code: 'updatedAt.invalid',
        message: 'updatedAt is invalid.',
      });

    const deletedAt = this.props.deletedAt;
    if (deletedAt !== null) {
      if (
        !this.isValidDate(deletedAt) ||
        deletedAt < this.props.createdAt ||
        deletedAt > now
      )
        issues.push({
          path: 'deletedAt',
          code: 'deletedAt.invalid',
          message: 'deletedAt is invalid.',
        });
    }
  }

  private validateRelations(issues: ValidationIssue[]) {
    const selfId = this.getId().toValue();
    const fatherIdVal = this.props.fatherId?.toValue();
    const motherIdVal = this.props.motherId?.toValue();

    if (fatherIdVal === selfId)
      issues.push({
        path: 'fatherId',
        code: 'relation.selfParent',
        message: 'Father cannot be self.',
      });
    if (motherIdVal === selfId)
      issues.push({
        path: 'motherId',
        code: 'relation.selfParent',
        message: 'Mother cannot be self.',
      });
    if (fatherIdVal && motherIdVal && fatherIdVal === motherIdVal)
      issues.push({
        path: 'fatherId|motherId',
        code: 'relation.parentsDistinct',
        message: 'Father and mother must be different.',
      });

    if (
      this.props.father &&
      this.props.father.getId().toValue() !== fatherIdVal
    )
      issues.push({
        path: 'father',
        code: 'relation.inconsistentId',
        message: 'Father entity does not match fatherId.',
      });
    if (
      this.props.mother &&
      this.props.mother.getId().toValue() !== motherIdVal
    )
      issues.push({
        path: 'mother',
        code: 'relation.inconsistentId',
        message: 'Mother entity does not match motherId.',
      });
    if (
      this.props.father &&
      (!this.isValidDate(this.props.father.getBirthDate()) ||
        this.props.father.getBirthDate() >= this.props.birthDate)
    )
      issues.push({
        path: 'father.birthDate',
        code: 'relation.birthOrder',
        message: "Father's birth date must be before child's birth date.",
      });
    if (
      this.props.mother &&
      (!this.isValidDate(this.props.mother.getBirthDate()) ||
        this.props.mother.getBirthDate() >= this.props.birthDate)
    )
      issues.push({
        path: 'mother.birthDate',
        code: 'relation.birthOrder',
        message: "Mother's birth date must be before child's birth date.",
      });
  }

  assertValid(): this {
    const result = this.validateAll();

    if (!result.ok)
      throw new DomainValidationError(
        'Validation failure in FamilyDomain',
        result.errors,
      );

    return this;
  }
}
