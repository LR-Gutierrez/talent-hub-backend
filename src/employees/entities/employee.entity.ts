import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { EmployeeStatus } from './employee-status.entity';
import { EmployeeHistory } from './employee-history.entity';
import { EmployeeEducation } from './employee-education.entity';
import { EmployeeUniform } from './employee-uniform.entity';
import { EmployeeChild } from './employee-child.entity';
import { EmployeeEmergencyContact } from './employee-emergency-contact.entity';
import { Department } from '../../departments/entities/department.entity';
import { Gender } from '../../catalogs/entities/gender.entity';
import { Country } from '../../catalogs/entities/country.entity';
import { MaritalStatus } from '../../catalogs/entities/marital-status.entity';
import { BloodType } from '../../catalogs/entities/blood-type.entity';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  phoneExtension: string;

  @Column({ nullable: true })
  corporatePhone: string;

  @Column({ nullable: true })
  satellitePhone: string;

  @Column({ nullable: true })
  roomPhone: string;

  @Column({ nullable: true })
  mobilePhone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ type: 'date', nullable: true })
  birthDate: string;

  @Column({ nullable: true })
  documentId: string;

  @ManyToOne(() => Gender, { nullable: true })
  @JoinColumn({ name: 'genderId' })
  genderRef: Gender;

  @Column({ nullable: true })
  genderId: string;

  @ManyToOne(() => Country, { nullable: true })
  @JoinColumn({ name: 'nationalityId' })
  nationalityRef: Country;

  @Column({ nullable: true })
  nationalityId: string;

  @ManyToOne(() => MaritalStatus, { nullable: true })
  @JoinColumn({ name: 'maritalStatusId' })
  maritalStatusRef: MaritalStatus;

  @Column({ nullable: true })
  maritalStatusId: string;

  @ManyToOne(() => Country, { nullable: true })
  @JoinColumn({ name: 'placeOfBirthId' })
  placeOfBirthRef: Country;

  @Column({ nullable: true })
  placeOfBirthId: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  photoUrl: string;

  @ManyToOne(() => BloodType, { nullable: true })
  @JoinColumn({ name: 'bloodTypeId' })
  bloodTypeRef: BloodType;

  @Column({ nullable: true })
  bloodTypeId: string;

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'departmentId' })
  department: Department;

  @Column({ nullable: true })
  departmentId: string;

  @Column({ nullable: true })
  position: string;

  @Column({ nullable: true })
  contractingCompany: string;

  @Column({ type: 'date', nullable: true })
  hireDate: string;

  @Column({ type: 'date', nullable: true })
  endDate: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  salary: number;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'supervisorId' })
  supervisor: Employee;

  @Column({ nullable: true })
  supervisorId: string;

  @ManyToOne(() => EmployeeStatus)
  @JoinColumn({ name: 'statusId' })
  status: EmployeeStatus;

  @Column()
  statusId: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => EmployeeEducation, (education) => education.employee, {
    cascade: true,
  })
  educations: EmployeeEducation[];

  @OneToMany(() => EmployeeUniform, (uniform) => uniform.employee, {
    cascade: true,
  })
  uniforms: EmployeeUniform[];

  @OneToMany(() => EmployeeChild, (child) => child.employee, { cascade: true })
  children: EmployeeChild[];

  @OneToMany(() => EmployeeEmergencyContact, (contact) => contact.employee, {
    cascade: true,
  })
  emergencyContacts: EmployeeEmergencyContact[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
