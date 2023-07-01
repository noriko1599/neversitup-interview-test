import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Order } from './order.entity';

@Entity()
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  uid: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @OneToOne(() => Order, (order) => order.customer)
  order: Order;
}
