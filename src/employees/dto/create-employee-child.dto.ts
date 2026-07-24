import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateEmployeeChildDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  gender?: string;
}
