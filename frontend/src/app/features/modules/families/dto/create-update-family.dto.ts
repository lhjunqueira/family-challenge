export interface CreateUpdateFamilyDto {
  name: string;
  birthDate: Date;
  document: string;
  fatherId: string | null;
  motherId: string | null;
}
