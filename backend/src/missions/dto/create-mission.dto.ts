import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  Min,
} from 'class-validator';
import { PaymentMethod } from '../enums/payment-method.enum';

export class CreateMissionDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNumber()
  @Min(5)
  price: number;

  @IsNotEmpty()
  @IsString()
  categoryId: string;

  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsNumber()
  @Min(15)
  estimatedDurationMinutes?: number;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;
}
