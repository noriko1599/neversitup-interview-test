import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { AppBaseEntity } from '../entity';
import { OrderItemProduct } from './order-item-product';

@Entity()
export class OrderItem extends AppBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.items)
  order: Order;

  @ManyToOne(() => OrderItemProduct)
  @JoinColumn()
  product: OrderItemProduct;

  @Column()
  quantity: number;
}
