import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class UpdateMeDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  username?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{11}$/, { message: 'CPF must contain exactly 11 digits' })
  cpf?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
