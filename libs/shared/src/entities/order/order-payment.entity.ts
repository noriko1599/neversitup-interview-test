import { Entity, PrimaryGeneratedColumn, OneToOne, Column } from 'typeorm';
import { Order } from './order.entity';

@Entity()
export class OrderPayment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  reference: string;

  @Column()
  amount: number;

  @Column({
    type: 'enum',
    enum: ['Arrangement', 'Settled', 'Cancelled'],
    default: 'Arrangement',
  })
  status: 'Arrangement' | 'Settled' | 'Cancelled';

  @OneToOne(() => Order, (order) => order.payment)
  order: Order;
}
