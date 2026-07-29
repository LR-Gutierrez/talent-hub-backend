import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsDateString,
  IsUUID,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateEmployeeChildDto } from './create-employee-child.dto';
import { CreateEmployeeEmergencyContactDto } from './create-employee-emergency-contact.dto';

export class CreateEmployeeDto {
  @IsString()
  fullName: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  phoneExtension?: string;

  @IsOptional()
  @IsString()
  corporatePhone?: string;

  @IsOptional()
  @IsString()
  satellitePhone?: string;

  @IsOptional()
  @IsString()
  roomPhone?: string;

  @IsOptional()
  @IsString()
  mobilePhone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  documentId?: string;

  @IsOptional()
  @IsUUID()
  genderId?: string;

  @IsOptional()
  @IsUUID()
  nationalityId?: string;

  @IsOptional()
  @IsUUID()
  maritalStatusId?: string;

  @IsOptional()
  @IsUUID()
  placeOfBirthId?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsUUID()
  bloodTypeId?: string;

  @IsOptional()
  @IsString()
  educationLevel?: string;

  @IsOptional()
  @IsString()
  degree?: string;

  @IsOptional()
  @IsString()
  institution?: string;

  @IsOptional()
  @IsString()
  graduationYear?: string;

  @IsOptional()
  @IsString()
  shirtSize?: string;

  @IsOptional()
  @IsString()
  pantSize?: string;

  @IsOptional()
  @IsString()
  shoeSize?: string;

  @IsOptional()
  @IsString()
  jacketSize?: string;

  @IsOptional()
  @IsString()
  helmetSize?: string;

  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsString()
  contractingCompany?: string;

  @IsOptional()
  @IsDateString()
  hireDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  salary?: number;

  @IsOptional()
  @IsUUID()
  supervisorId?: string;

  @IsUUID()
  statusId: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEmployeeChildDto)
  children?: CreateEmployeeChildDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEmployeeEmergencyContactDto)
  emergencyContacts?: CreateEmployeeEmergencyContactDto[];
}
