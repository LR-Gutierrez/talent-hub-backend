import { IsString, IsOptional, IsNumber, IsBoolean, IsObject } from 'class-validator';

export class CreateCatalogDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  value?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  dialCode?: string;

  @IsOptional()
  @IsObject()
  translations?: Record<string, string>;
}
