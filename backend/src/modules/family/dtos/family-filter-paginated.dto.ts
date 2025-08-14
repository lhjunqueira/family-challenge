import { IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class FamilyFilterPaginatedDto {
  @ApiPropertyOptional({
    description: 'Text for partial search by name or document',
    minLength: 1,
    maxLength: 120,
    example: 'Silva',
  })
  @IsOptional()
  @IsString()
  @Length(1, 120)
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value
          .normalize('NFD')
          .replace(/\p{Diacritic}/gu, '')
          .trim()
          .replace(/\s+/g, ' ')
      : value,
  )
  search?: string;

  @ApiPropertyOptional({
    description: 'Page number (>= 0)',
    minimum: 0,
    example: 0,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Transform(({ value }) => (value === undefined || value === '' ? 0 : value))
  page: number = 0;

  @ApiPropertyOptional({
    description: 'Items per page limit (1 - 100)',
    minimum: 1,
    maximum: 100,
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => (value === undefined || value === '' ? 10 : value))
  limit?: number = 10;
}
