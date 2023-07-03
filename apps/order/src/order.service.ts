import { CreateOrderDTO } from '@app/shared/dto/order/create-order.dto';
import { Order } from '@app/shared/entities/order/order.entity';
import { OrderItem } from '@app/shared/entities/order/order-item.entity';
import { Customer } from '@app/shared/entities/order/customer.entity';
import { Shipping } from '@app/shared/entities/order/shipping.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { SuccessfulReservationDTO } from '@app/shared/dto/product/reserve-product.dto';
import { OrderPayment } from '@app/shared/entities/order/order-payment.entity';
import { OrderItemProduct } from '@app/shared/entities/order/order-item-product';
import { EventstoreDBAppClient } from '@app/shared/eventstoredb.client';
import { jsonEvent } from '@eventstore/db-client';
import {
  CreateOrderRequestedPattern,
  CreateOrderRequestedPayload,
} from '@app/shared/events/order/create-order-requested.event';
import { v4 as uuid } from 'uuid';
import {
  OrderCreatedPattern,
  OrderCreatedPayload,
} from '@app/shared/events/order/order-created.event';
import {
  OrderCancelledPattern,
  OrderCancelledPayload,
} from '@app/shared/events/order/order-cancelled.event';
import { ProductQuantityReservedForOrderPayload } from '@app/shared/events/product/product-quantity-reserved-for-order.event';
import {
  ProductQuantityReservationForOrderFailedPattern,
  ProductQuantityReservationForOrderFailedPayload,
} from '@app/shared/events/product/product-quantity-reservation-for-order-failed.event';
import {
  CreateOrderRequestFailedPattern,
  CreateOrderRequestFailedPayload,
} from '@app/shared/events/order/create-order-request-failed.event';

@Injectable()
export class OrderService {
  readonly client!: EventstoreDBAppClient;
  constructor(
    private readonly connection: Connection,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(OrderItemProduct)
    private readonly orderItemProductRepository: Repository<OrderItemProduct>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Shipping)
    private readonly shippingRepository: Repository<Shipping>,
    @InjectRepository(OrderPayment)
    private readonly paymentRepository: Repository<OrderPayment>,
  ) {
    this.client = new EventstoreDBAppClient(`esdb://localhost:2113?tls=false`);
  }

  getEventstoreDBStreamName(id: number) {
    return `order-${id}`;
  }

  async createRequest(createOrderDto: CreateOrderDTO) {
    const order = await this.orderRepository.save(
      this.orderRepository.create({
        customer: this.customerRepository.create(createOrderDto.customer),
        shipping: this.shippingRepository.create(createOrderDto.shipping),
        status: 'Creating',
      }),
    );

    const event = this.client.createEvent<CreateOrderRequestedPayload>(
      CreateOrderRequestedPattern,
      {
        orderId: order.id,
        requestedData: createOrderDto,
      },
    );
    this.client.emit(this.getEventstoreDBStreamName(order.id), event);

    return order;
  }

  async rollbackCreateRequest(
    payload: ProductQuantityReservationForOrderFailedPayload,
  ) {
    const order = await this.orderRepository.findOne({
      where: { id: payload.orderId },
    });
    const removedOrder = await this.orderRepository.remove(order);

    const event = this.client.createEvent<CreateOrderRequestFailedPayload>(
      CreateOrderRequestFailedPattern,
      payload,
    );

    this.client.emit(this.getEventstoreDBStreamName(payload.orderId), event);

    return removedOrder;
  }

  async commitCreateRequest(
    payload: ProductQuantityReservedForOrderPayload,
  ): Promise<Order> {
    const queryRunner = this.connection.createQueryRunner();

    // start a new transaction
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager.findOne(Order, {
        where: { id: payload.orderId },
        relations: ['customer', 'shipping'],
      });

      const orderItemProducts = payload.reservedProducts.map((item) =>
        this.orderItemProductRepository.create({
          sku: item.product.sku,
          price: item.product.price,
        }),
      );

      // Save order item products using queryRunner.manager
      await queryRunner.manager.save(orderItemProducts);

      const items = payload.reservedProducts.map((item, index) =>
        this.orderItemRepository.create({
          product: orderItemProducts[index],
          quantity: item.reservedQuantity,
        }),
      );

      const totalCost = items.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0,
      );

      const payment = this.paymentRepository.create({
        status: 'Arrangement',
        amount: totalCost,
      });

      order.items = items;
      order.payment = payment;
      order.status = 'Open';

      // save order
      await queryRunner.manager.save(order);

      // if everything is fine, commit the transaction
      await queryRunner.commitTransaction();

      const event = this.client.createEvent<OrderCreatedPayload>(
        OrderCreatedPattern,
        {
          createdOrder: order,
        },
      );
      this.client.emit(this.getEventstoreDBStreamName(order.id), event);

      return order;
    } catch (error) {
      console.error(error);

      // since we have catched error, we can rollback the transaction
      await queryRunner.rollbackTransaction();
      throw new Error(
        `Error occurred while saving the order: ${error.message}`,
      );
    } finally {
      // you need to release queryRunner which is manually created:
      await queryRunner.release();
    }
  }

  async cancelOrder(orderId: number, uid: number): Promise<Order> {
    const queryRunner = this.connection.createQueryRunner();

    // start a new transaction
    await queryRunner.startTransaction();

    try {
      // Find the order
      const order = await this.orderRepository.findOne({
        where: {
          id: orderId,
          customer: {
            uid,
          },
        },
        relations: ['customer', 'payment', 'items', 'items.product'],
      });

      // If order is not found, throw an error
      if (!order) {
        throw new Error('Order not found');
      }

      // Update order status to 'Cancelled' and payment status to 'Refund'
      order.status = 'Cancelled';
      order.payment.status = 'Refunded';

      // Save changes
      await queryRunner.manager.save(order);

      // if everything is fine, commit the transaction
      await queryRunner.commitTransaction();

      const event = this.client.createEvent<OrderCancelledPayload>(
        OrderCancelledPattern,
        {
          cancelledOrder: order,
        },
      );
      this.client.emit(this.getEventstoreDBStreamName(order.id), event);

      return order;
    } catch (error) {
      console.error(error);

      // since we have caught error, we can rollback the transaction
      await queryRunner.rollbackTransaction();

      throw new Error(
        `Error occurred while cancelling the order: ${error.message}`,
      );
    } finally {
      // you need to release queryRunner which is manually created:
      await queryRunner.release();
    }
  }

  gerOrderRepository() {
    return this.orderRepository;
  }
}
