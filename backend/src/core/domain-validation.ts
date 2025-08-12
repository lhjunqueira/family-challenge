export type ValidationResult = {
  ok: boolean;
  errors: ValidationIssue[];
};

export type ValidationIssue = {
  path: string;
  code: string;
  message: string;
};

export class DomainValidationError extends Error {
  constructor(
    message: string,
    public readonly issues: ValidationIssue[],
  ) {
    super(message);
    this.name = 'DomainValidationError';
  }
}
