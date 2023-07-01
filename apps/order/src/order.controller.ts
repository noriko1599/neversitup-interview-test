import {
  OrderCreated,
  OrderCreatedPattern,
} from '@app/shared/events/order/order-created.event';
import { Body, Controller, Post } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';

@Controller()
export class OrderController {
  @Post()
  async create(@Body() payload: any) {}

  @MessagePattern('create_order')
  async handleCreateOrder(payload: any) {}

  @EventPattern(OrderCreatedPattern)
  async handleOrderCreated(event: OrderCreated) {}
}
