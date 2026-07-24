import { Entity } from 'typeorm';
import { BaseCatalogEntity } from './base-catalog.entity';

@Entity('genders')
export class Gender extends BaseCatalogEntity {}
