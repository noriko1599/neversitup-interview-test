import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Order } from './order.entity';

@Entity()
export class Shipping {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  country: string;

  @Column()
  postalCode: string;

  @OneToOne(() => Order, (order) => order.shipping)
  order: Order;
}
