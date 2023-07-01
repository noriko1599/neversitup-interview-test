import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../product/product.entity';
import { AppBaseEntity } from '../entity';
import { OrderItemProduct } from './order-item-product';

@Entity()
export class OrderItem extends AppBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.items)
  order: Order;

  @ManyToOne(() => OrderItemProduct)
  product: OrderItemProduct;

  @Column()
  quantity: number;
}
