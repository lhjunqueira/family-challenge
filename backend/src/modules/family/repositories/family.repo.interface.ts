export interface FamilyDatabaseInterface {
  id: string;
  name: string;
  birthDate: Date;
  document: string;
  fatherId: string | null;
  motherId: string | null;
}
