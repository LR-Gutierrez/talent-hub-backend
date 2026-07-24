import { Entity } from 'typeorm';
import { BaseCatalogEntity } from './base-catalog.entity';

@Entity('employee_degrees')
export class EmployeeDegree extends BaseCatalogEntity {}
