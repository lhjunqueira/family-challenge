import { BaseProps } from './base-props';
import { UniqueEntityID } from './unique-entity-id';

export abstract class Entity<T extends BaseProps> {
  protected _id: UniqueEntityID;
  protected props: T;

  constructor(
    props: Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> &
      Partial<Pick<T, 'createdAt' | 'updatedAt' | 'deletedAt'>>,
    id?: UniqueEntityID,
  ) {
    this._id = id ?? new UniqueEntityID();

    this.props = {
      ...props,
      createdAt: props.createdAt ? new Date(props.createdAt) : new Date(),
      updatedAt: props.updatedAt ? new Date(props.updatedAt) : new Date(),
      deletedAt: props.deletedAt ? new Date(props.deletedAt) : null,
    } as T;
  }

  getId = (): UniqueEntityID => this._id;
  isDeleted = (): boolean => this.props.deletedAt !== null;

  softDelete(): void {
    this.props.deletedAt = new Date();
  }

  update(updates: Partial<Omit<T, 'id' | keyof BaseProps>>): void {
    this.props = { ...this.props, ...updates };
  }
}
