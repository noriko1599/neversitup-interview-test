import { CreateOrderDTO } from '@app/shared/dto/order/create-order.dto';
import { ReserveProductResponseDTO } from '@app/shared/dto/product/reserve-product.dto';
import {
  OrderCreated,
  OrderCreatedPattern,
} from '@app/shared/events/order/order-created.event';
import { HttpService } from '@nestjs/axios';
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { OrderService } from './order.service';
import { CancelOrderDTO } from '@app/shared/dto/order/cancel-order.dto';

@Controller()
export class OrderController {
  constructor(
    private readonly httpService: HttpService,
    private readonly orderService: OrderService,
  ) {}
  private productHttpUrl = `http://localhost:3002`;

  @Get('user/:userId')
  async getUserOrders(@Param() params: { userId: number }) {
    const order = await this.orderService.gerOrderRepository().findOne({
      where: {
        customer: {
          uid: params.userId,
        },
      },
      relations: ['payment', 'customer', 'shipping', 'items', 'items.product'],
    });

    return order;
  }

  @Get(':id')
  async getUserOrderDetail(
    @Param() params: { id: number },
    @Query() query: { userId: number },
  ) {
    const order = await this.orderService.gerOrderRepository().findOne({
      where: {
        id: params.id,
        customer: {
          uid: query.userId,
        },
      },
      relations: ['payment', 'customer', 'shipping', 'items', 'items.product'],
    });

    return order;
  }

  @Post()
  async create(@Body() body: CreateOrderDTO) {
    try {
      const { data: reserveProductResult } = await this.httpService
        .post<ReserveProductResponseDTO>(
          `${this.productHttpUrl}/reserveProducts`,
          { items: body.items },
        )
        .toPromise();

      if (reserveProductResult.failedReservations.length > 0) {
        // throw an exception with a useful message and status code
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: 'Failed to reserve one or more items',
            failedReservations: reserveProductResult.failedReservations,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // If all reservations were successful, create the order
      const order = await this.orderService.create(
        body,
        reserveProductResult.successfulReservations,
      );
      return {
        order,
        reservedProducts: reserveProductResult.successfulReservations,
      };
    } catch (error) {
      console.error(error);

      if (error instanceof HttpException) {
        // rethrow the error if it's already an HttpException
        throw error;
      } else {
        // unexpected error, throw a 500
        throw new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: 'An unexpected error occurred',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @Post('cancel')
  async cancel(@Body() body: CancelOrderDTO) {
    try {
      const { orderId, uid } = body;

      // Check if order exists and cancel the order
      const cancelledOrder = await this.orderService.cancelOrder(orderId, uid);

      // Return a response message
      return {
        message: 'Order has been cancelled successfully',
        order: cancelledOrder,
      };
    } catch (error) {
      console.error(error);

      // If the order is not found or another exception occurred, throw an HttpException
      if (error.message === 'Order not found') {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: 'Order not found',
          },
          HttpStatus.NOT_FOUND,
        );
      } else if (error.message.includes('Refund failed')) {
        throw new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: 'Refund failed. Order cancellation failed',
            reason: error.message,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else {
        throw new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: 'An unexpected error occurred',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
