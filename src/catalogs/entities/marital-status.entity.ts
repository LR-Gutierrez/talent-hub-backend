import { Entity } from 'typeorm';
import { BaseCatalogEntity } from './base-catalog.entity';

@Entity('marital_statuses')
export class MaritalStatus extends BaseCatalogEntity {}
