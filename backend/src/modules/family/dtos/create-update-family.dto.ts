import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
  MinDate,
  MaxDate,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUpdateFamilyDto {
  @ApiProperty({
    description: 'Full name',
    minLength: 2,
    maxLength: 120,
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 120)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value,
  )
  name: string;

  @ApiProperty({
    description: 'Birth date (cannot be in the future; minimum 1900-01-01)',
    type: String,
    format: 'date-time',
    example: '1990-05-20T00:00:00.000Z',
  })
  @Type(() => Date)
  @IsDate()
  @MinDate(new Date('1900-01-01T00:00:00.000Z'))
  @MaxDate(new Date())
  @Transform(({ value }) =>
    value &&
    (typeof value === 'string' ||
      typeof value === 'number' ||
      value instanceof Date)
      ? new Date(value)
      : value,
  )
  birthDate: Date;

  @ApiProperty({
    description: 'Document/ID (up to 50 characters)',
    maxLength: 50,
    example: '12345678900',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  document: string;

  @ApiPropertyOptional({
    description: 'Father ID (UUID v4)',
    format: 'uuid',
    example: '9d5e1b0c-8a6d-4f0a-8f95-0a0c0d0e0f10',
  })
  @IsOptional()
  @IsUUID('4')
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim() === ''
        ? undefined
        : value.trim()
      : value,
  )
  fatherId: string | null;

  @ApiPropertyOptional({
    description: 'Mother ID (UUID v4)',
    format: 'uuid',
    example: '1e2f3a4b-5c6d-7e8f-9a0b-1c2d3e4f5a6b',
  })
  @IsOptional()
  @IsUUID('4')
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim() === ''
        ? undefined
        : value.trim()
      : value,
  )
  motherId: string | null;
}
