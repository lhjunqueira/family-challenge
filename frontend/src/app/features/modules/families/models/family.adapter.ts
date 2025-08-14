import { FamilyModel } from './family.model';

// Garante que birthDate e datas aninhadas sejam instâncias de Date.
export function adaptFamily(raw: any): FamilyModel {
  if (!raw) return raw;
  const parseDate = (d: any) => (d ? new Date(d) : d);
  return {
    id: raw.id,
    name: raw.name,
    birthDate: parseDate(raw.birthDate),
    document: raw.document,
    fatherId: raw.fatherId ?? null,
    motherId: raw.motherId ?? null,
    father: raw.father ? adaptFamily(raw.father) : undefined,
    mother: raw.mother ? adaptFamily(raw.mother) : undefined,
    children: Array.isArray(raw.children)
      ? raw.children.map((c: any) => adaptFamily(c))
      : raw.children,
  } as FamilyModel;
}

export function adaptFamilies(raw: any[]): FamilyModel[] {
  return (raw || []).map(adaptFamily);
}
