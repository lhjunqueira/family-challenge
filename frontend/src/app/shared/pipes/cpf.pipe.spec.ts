import { CpfPipe } from './cpf.pipe';

describe('CpfPipe', () => {
  const pipe = new CpfPipe();

  it('should format a full CPF', () => {
    expect(pipe.transform('12345678901')).toBe('123.456.789-01');
  });

  it('should hide middle digits when hide=true', () => {
    expect(pipe.transform('12345678901', { hide: true })).toBe(
      '123.***.***-01'
    );
  });

  it('should return only digits when unmask=true', () => {
    expect(pipe.transform('123.456.789-01', { unmask: true })).toBe(
      '12345678901'
    );
  });

  it('should return empty string when value is null', () => {
    expect(pipe.transform(null)).toBe('');
  });
});
