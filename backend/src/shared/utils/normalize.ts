export function normalizeBasic(value: string | null | undefined): string {
  if (!value) return '';
  const trimmed = value.trim();
  return trimmed
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}
