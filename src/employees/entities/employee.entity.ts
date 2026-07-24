import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { EmployeeStatus } from './employee-status.entity';
import { Department } from '../../departments/entities/department.entity';
import { EmployeeEducation } from './employee-education.entity';
import { EmployeeUniform } from './employee-uniform.entity';
import { EmployeeChild } from './employee-child.entity';
import { EmployeeEmergencyContact } from './employee-emergency-contact.entity';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column({ unique: true })
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

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  nationality: string;

  @Column({ nullable: true })
  maritalStatus: string;

  @Column({ nullable: true })
  placeOfBirth: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

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

  @OneToMany(() => EmployeeEducation, (education) => education.employee, { cascade: true })
  educations: EmployeeEducation[];

  @OneToMany(() => EmployeeUniform, (uniform) => uniform.employee, { cascade: true })
  uniforms: EmployeeUniform[];

  @OneToMany(() => EmployeeChild, (child) => child.employee, { cascade: true })
  children: EmployeeChild[];

  @OneToMany(() => EmployeeEmergencyContact, (contact) => contact.employee, { cascade: true })
  emergencyContacts: EmployeeEmergencyContact[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
