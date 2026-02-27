import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

const availablePlans = ['GRATUITO', 'PREMIUM'] as const;

export class CompleteOnboardingDto {
  @IsNumber()
  @Min(1)
  heightCm: number;

  @IsNumber()
  @Min(1)
  weightKg: number;

  @IsIn(availablePlans)
  plan: (typeof availablePlans)[number];

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  yearsExperience?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  professionalRegistration?: string;
}
