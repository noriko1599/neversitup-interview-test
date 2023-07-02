import { Column, Entity } from 'typeorm';
import { AppBaseEntity } from '../entity';

@Entity()
export class Product extends AppBaseEntity {
  @Column()
  sku: string;

  @Column()
  name: string;

  @Column()
  price: number;

  @Column()
  stock: number;
}
