import { IsString } from 'class-validator';

export class CreateEmployeeEmergencyContactDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsString()
  relationship: string;
}
