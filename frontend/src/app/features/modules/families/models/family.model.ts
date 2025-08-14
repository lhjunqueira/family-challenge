export interface FamilyModel {
  id: string;
  name: string;
  birthDate: Date;
  document: string;
  fatherId: string | null;
  motherId: string | null;

  father?: FamilyModel;
  mother?: FamilyModel;
  children?: FamilyModel[] | null;
}
