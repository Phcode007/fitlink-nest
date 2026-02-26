import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProgressDto {
  @IsOptional()
  @IsNumber()
  weightKg?: number;

  @IsOptional()
  @IsNumber()
  bodyFatPercent?: number;

  @IsOptional()
  @IsNumber()
  muscleMassKg?: number;

  @IsOptional()
  @IsNumber()
  bmi?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
