import { Entity, Column } from 'typeorm';
import { BaseCatalogEntity } from './base-catalog.entity';

@Entity('uniform_sizes')
export class UniformSize extends BaseCatalogEntity {
  @Column({ type: 'varchar', length: 50 })
  category: string;
}
