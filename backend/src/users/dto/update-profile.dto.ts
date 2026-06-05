import { IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  defaultAddress?: string;

  @IsOptional()
  @IsString()
  profilePictureUrl?: string;
}
