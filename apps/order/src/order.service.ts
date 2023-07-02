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

@Injectable()
export class OrderService {
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
  ) {}

  async create(
    createOrderDto: CreateOrderDTO,
    reservedProducts: SuccessfulReservationDTO[],
  ): Promise<Order> {
    const queryRunner = this.connection.createQueryRunner();

    // start a new transaction
    await queryRunner.startTransaction();

    try {
      const customer = this.customerRepository.create(createOrderDto.customer);
      const shipping = this.shippingRepository.create(createOrderDto.shipping);

      const orderItemProducts = reservedProducts.map((item) =>
        this.orderItemProductRepository.create({
          sku: item.product.sku,
          price: item.product.price,
        }),
      );

      // Save order item products using queryRunner.manager
      await queryRunner.manager.save(orderItemProducts);

      const items = reservedProducts.map((item, index) =>
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

      const order = this.orderRepository.create({
        customer,
        items,
        shipping,
        payment,
      });
      // save order
      await queryRunner.manager.save(order);

      // if everything is fine, commit the transaction
      await queryRunner.commitTransaction();

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

  private async refund(payment: OrderPayment) {
    // Mock call to Payment Gateway API
    return {
      status: 'success',
      reason: '',
    };
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
        relations: ['payment'],
      });

      // If order is not found, throw an error
      if (!order) {
        throw new Error('Order not found');
      }
      // Call to payment gateway API for refund initiation
      const refundResult = await this.refund(order.payment);

      if (refundResult.status !== 'success') {
        // Since refund failed, rollback the transaction
        await queryRunner.rollbackTransaction();

        throw new Error(`Refund failed with reason: ${refundResult.reason}`);
      }

      // Update order status to 'Cancelled' and payment status to 'Refund'
      order.status = 'Cancelled';
      order.payment.status = 'Refunded';

      // Save changes
      await queryRunner.manager.save(order);

      // if everything is fine, commit the transaction
      await queryRunner.commitTransaction();

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
