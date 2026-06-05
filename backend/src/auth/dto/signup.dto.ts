import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  MinLength,
} from 'class-validator';
import { Role } from '../../users/enums/role.enum';

export class SignupDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsEnum(Role)
  role: Role; // Now required (CLIENT or PROVIDER)

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string; // Required for PROVIDER (validated in service)

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  referralCode?: string; // For the referral system
}
