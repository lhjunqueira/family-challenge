import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'cpf', standalone: true })
export class CpfPipe implements PipeTransform {
  transform(
    value: string | number | null | undefined,
    options?: { hide?: boolean; unmask?: boolean }
  ): string {
    if (value === null || value === undefined) return '';

    let digits = String(value).replace(/\D+/g, '');

    if (options?.unmask) return digits;

    if (digits.length > 11) digits = digits.substring(0, 11);

    if (digits.length <= 3) return digits;

    if (digits.length <= 6)
      return `${digits.substring(0, 3)}.${digits.substring(3)}`;

    if (digits.length <= 9)
      return `${digits.substring(0, 3)}.${digits.substring(
        3,
        6
      )}.${digits.substring(6)}`;

    const formatted = `${digits.substring(0, 3)}.${digits.substring(
      3,
      6
    )}.${digits.substring(6, 9)}-${digits.substring(9)}`;

    if (options?.hide)
      return `${digits.substring(0, 3)}.***.***-${digits.substring(9)}`;

    return formatted;
  }
}
