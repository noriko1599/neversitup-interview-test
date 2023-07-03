import { CreateOrderDTO } from '@app/shared/dto/order/create-order.dto';
import { ReserveProductResponseDTO } from '@app/shared/dto/product/reserve-product.dto';
import {
  OrderCreated,
  OrderCreatedPattern,
  OrderCreatedPayload,
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
  Res,
} from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { OrderService } from './order.service';
import { CancelOrderDTO } from '@app/shared/dto/order/cancel-order.dto';
import {
  CreateOrderRequestFailedPattern,
  CreateOrderRequestFailedPayload,
} from '@app/shared/events/order/create-order-request-failed.event';
import { Response } from 'express';
import {
  ProductQuantityReservedForOrderPattern,
  ProductQuantityReservedForOrderPayload,
} from '@app/shared/events/product/product-quantity-reserved-for-order.event';
import {
  ProductQuantityReservationForOrderFailedPattern,
  ProductQuantityReservationForOrderFailedPayload,
} from '@app/shared/events/product/product-quantity-reservation-for-order-failed.event';
import { EventstoreDBAppEvent } from '@app/shared/events/event.interface';

@Controller()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

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
  async create(@Body() body: CreateOrderDTO, @Res() res: Response) {
    try {
      const { id } = await this.orderService.createRequest(body);

      const subscription =
        this.orderService.client.eventstoredb.subscribeToStream(
          this.orderService.getEventstoreDBStreamName(id),
          {
            resolveLinkTos: true,
            fromRevision: 'start',
          },
        );

      subscription.on('data', (resolvedEvent) => {
        const { event } = resolvedEvent;
        if (event.type == OrderCreatedPattern) {
          const { createdOrder } = event.data as OrderCreatedPayload;
          res.status(201).json({ createdOrder });
        }

        if (event.type == CreateOrderRequestFailedPattern) {
          const { failedProducts } =
            event.data as CreateOrderRequestFailedPayload;
          res.status(400).json({
            failedProducts,
          });
        }
      });
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

  @EventPattern(ProductQuantityReservedForOrderPattern)
  async createOrderWhenProductQuantityReserved(
    payload: EventstoreDBAppEvent<ProductQuantityReservedForOrderPayload>,
  ) {
    await this.orderService.commitCreateRequest(payload.data);
  }

  @EventPattern(ProductQuantityReservationForOrderFailedPattern)
  async handleProductQuantityReservationForOrderFailed(
    payload: EventstoreDBAppEvent<ProductQuantityReservationForOrderFailedPayload>,
  ) {
    await this.orderService.rollbackCreateRequest(payload.data);
  }
}
