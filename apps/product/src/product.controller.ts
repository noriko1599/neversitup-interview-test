import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { ReserveProductDTO } from '@app/shared/dto/product/reserve-product.dto';
import { FindProductDTO } from '@app/shared/dto/product/find-product.dto';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import {
  CreateOrderRequestedPattern,
  CreateOrderRequestedPayload,
} from '@app/shared/events/order/create-order-requested.event';
import { EventstoreDBAppEvent } from '@app/shared/events/event.interface';
import {
  OrderCancelledPattern,
  OrderCancelledPayload,
} from '@app/shared/events/order/order-cancelled.event';

@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async find(@Query() query: FindProductDTO) {
    const { skip = 0, take = 10, sku } = query;

    const products = await this.productService
      .getProductRepository()
      .find({ where: { sku }, skip, take, order: { id: 'ASC' } });

    return products;
  }

  @Get(':id')
  async findOneById(@Param() params: { id: number }) {
    const { id } = params;

    const product = await this.productService
      .getProductRepository()
      .findOne({ where: { id } });

    return product;
  }

  @EventPattern(CreateOrderRequestedPattern)
  async reserveProductsWhenCreateOrderRequested(
    payload: EventstoreDBAppEvent<CreateOrderRequestedPayload>,
  ) {
    await this.productService.reserveQuantityForOrder(payload.data);
  }

  @EventPattern(OrderCancelledPattern)
  async restoreProductQuantityWhenOrderCancelled(
    payload: EventstoreDBAppEvent<OrderCancelledPayload>,
  ) {
    await this.productService.restoreQuantityFromOrder(payload.data);
  }
}
