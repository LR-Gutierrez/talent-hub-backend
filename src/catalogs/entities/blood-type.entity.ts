import { Entity } from 'typeorm';
import { BaseCatalogEntity } from './base-catalog.entity';

@Entity('blood_types')
export class BloodType extends BaseCatalogEntity {}
