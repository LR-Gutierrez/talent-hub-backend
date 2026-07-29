import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('company_settings')
export class CompanySettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyName: string;

  @Column({ nullable: true })
  companyRuc: string;

  @Column({ nullable: true })
  companyLogo: string;

  @Column({ nullable: true })
  companyAddress: string;

  @Column({ nullable: true })
  companyPhone: string;

  @Column({ nullable: true })
  companyEmail: string;

  @Column({ default: 'America/Caracas' })
  timezone: string;

  @Column({ default: 'DD/MM/YYYY' })
  dateFormat: string;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ default: 'es' })
  defaultLang: string;

  @Column({ nullable: true })
  favicon: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
