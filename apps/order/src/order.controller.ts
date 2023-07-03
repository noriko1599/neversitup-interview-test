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
    const orders = await this.orderService.gerOrderRepository().find({
      where: {
        customer: {
          uid: params.userId,
        },
      },
      relations: ['payment', 'customer', 'shipping', 'items', 'items.product'],
      order: {
        createdAt: 'DESC',
      },
    });

    return orders;
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
      throw error;
    }
  }

  @Post('cancel')
  async cancel(@Body() body: CancelOrderDTO) {
    try {
      const { orderId, uid } = body;

      const cancelledOrder = await this.orderService.cancelOrder(orderId, uid);

      return {
        cancelledOrder,
      };
    } catch (error) {
      throw error;
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
