import { IsUUID, IsOptional, IsString } from 'class-validator';

export class ChangeEmployeeStatusDto {
  @IsUUID()
  statusId: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
