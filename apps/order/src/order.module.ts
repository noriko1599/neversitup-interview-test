import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { Order } from '@app/shared/entities/order/order.entity';
import { OrderItem } from '@app/shared/entities/order/order-item.entity';
import { Customer } from '@app/shared/entities/order/customer.entity';
import { Shipping } from '@app/shared/entities/order/shipping.entity';
import { OrderPayment } from '@app/shared/entities/order/order-payment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItemProduct } from '@app/shared/entities/order/order-item-product';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'order',
      entities: [
        Order,
        OrderItem,
        Customer,
        Shipping,
        OrderPayment,
        OrderItemProduct,
      ],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      Customer,
      Shipping,
      OrderPayment,
      OrderItemProduct,
    ]),
    HttpModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
