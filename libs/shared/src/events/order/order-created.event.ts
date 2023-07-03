import { Order } from '@app/shared/entities/order/order.entity';
import { IAppEvent } from '../event.interface';

export const OrderCreatedPattern = 'order_created';

export type OrderCreatedPayload = {
  createdOrder: Order;
};

export type OrderCreated = IAppEvent<'order_created', OrderCreatedPayload>;
