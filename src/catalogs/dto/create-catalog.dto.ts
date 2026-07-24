import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

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
}
