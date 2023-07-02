import { Entity, PrimaryGeneratedColumn, OneToOne, Column } from 'typeorm';
import { Order } from './order.entity';

@Entity()
export class OrderPayment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'payment_gateway_1' })
  method: string;

  @Column({ nullable: true })
  reference: string;

  @Column()
  amount: number;

  @Column({
    type: 'enum',
    enum: ['Arrangement', 'Settled', 'Cancelled', 'Refunded'],
    default: 'Arrangement',
  })
  status: 'Arrangement' | 'Settled' | 'Cancelled' | 'Refunded';

  @OneToOne(() => Order, (order) => order.payment)
  order: Order;
}
