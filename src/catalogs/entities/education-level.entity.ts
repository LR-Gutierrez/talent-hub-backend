import { Entity } from 'typeorm';
import { BaseCatalogEntity } from './base-catalog.entity';

@Entity('education_levels')
export class EducationLevel extends BaseCatalogEntity {}
