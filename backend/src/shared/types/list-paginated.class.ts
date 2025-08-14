export class ListPaginated<T> {
  items: T[];
  total: number;

  constructor(items: T[], total: number) {
    this.items = items;
    this.total = total;
  }
}
