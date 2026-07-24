import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Employee } from './employee.entity';

@Entity('employee_uniforms')
export class EmployeeUniform {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Employee, (employee) => employee.uniforms, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column()
  employeeId: string;

  @Column({ nullable: true })
  shirtSize: string;

  @Column({ nullable: true })
  pantSize: string;

  @Column({ nullable: true })
  shoeSize: string;

  @Column({ nullable: true })
  jacketSize: string;

  @Column({ nullable: true })
  helmetSize: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
