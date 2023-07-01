import { IAppEvent } from '../event.interface';

export const OrderCreatedPattern = 'order_created';

export type OrderCreatedPayload = {
  id: number;
  dev: boolean;
};

export type OrderCreated = IAppEvent<'order_created', OrderCreatedPayload>;
