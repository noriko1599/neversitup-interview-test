import {
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { OrderItem } from './order-item.entity';
import { Shipping } from './shipping.entity';
import { Customer } from './customer.entity';
import { AppBaseEntity } from '../entity';
import { OrderPayment } from './order-payment.entity';

@Entity()
export class Order extends AppBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Customer, (customer) => customer.order, { cascade: true })
  @JoinColumn()
  customer: Customer;

  @OneToOne(() => Shipping, (shipping) => shipping.order, { cascade: true })
  @JoinColumn()
  shipping: Shipping;

  @OneToOne(() => OrderPayment, (payment) => payment.order, { cascade: true })
  @JoinColumn()
  payment: OrderPayment;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  @JoinColumn()
  items: OrderItem[];

  @Column({
    type: 'enum',
    enum: ['Open', 'Closed', 'Cancelled'],
    default: 'Open',
  })
  status: 'Open' | 'Closed' | 'Cancelled';
}
