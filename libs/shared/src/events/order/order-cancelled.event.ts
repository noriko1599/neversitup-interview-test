import { Order } from '@app/shared/entities/order/order.entity';
import { IAppEvent } from '../event.interface';

export const OrderCancelledPattern = 'order_cancelled';

export type OrderCancelledPayload = {
  cancelledOrder: Order;
};

export type OrderCancelled = IAppEvent<
  'order_cancelled',
  OrderCancelledPayload
>;
