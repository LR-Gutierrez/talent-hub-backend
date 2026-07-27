import { IsUUID, IsArray, IsOptional, IsString } from 'class-validator';

export class BulkChangeEmployeeStatusDto {
  @IsArray()
  @IsUUID('4', { each: true })
  employeeIds: string[];

  @IsUUID()
  statusId: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
