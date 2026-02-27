import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

const professionalsRoles = ['TRAINER', 'NUTRITIONIST', 'ALL'] as const;

export class SearchProfessionalsDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  q: string;

  @IsOptional()
  @IsIn(professionalsRoles)
  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() : value))
  role?: (typeof professionalsRoles)[number];
}
