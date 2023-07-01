import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { AppBaseEntity } from '../entity';
import { OrderItem } from './order-item.entity';

@Entity()
export class OrderItemProduct extends AppBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sku: string;

  @Column()
  price: number;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];
}
