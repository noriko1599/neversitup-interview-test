import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AppBaseEntity } from '../entity';

@Entity()
export class Product extends AppBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sku: string;

  @Column()
  name: string;

  @Column()
  price: number;

  @Column()
  stock: number;
}
