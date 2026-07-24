import { Entity, Column } from 'typeorm';
import { BaseCatalogEntity } from './base-catalog.entity';

@Entity('countries')
export class Country extends BaseCatalogEntity {
  @Column({ type: 'varchar', length: 10 })
  dialCode: string;
}
