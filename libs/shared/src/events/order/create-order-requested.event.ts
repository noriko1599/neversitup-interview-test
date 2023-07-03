import { Order } from '@app/shared/entities/order/order.entity';
import { IAppEvent } from '../event.interface';
import { CreateOrderDTO } from '@app/shared/dto/order/create-order.dto';

export const CreateOrderRequestedPattern = 'create_order_requested';

export type CreateOrderRequestedPayload = {
  orderId: number;
  requestedData: CreateOrderDTO;
};

export type CreateOrderRequested = IAppEvent<
  'create_order_requested',
  CreateOrderRequestedPayload
>;
