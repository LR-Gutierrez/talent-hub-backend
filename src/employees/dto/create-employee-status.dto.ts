import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateEmployeeStatusDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
