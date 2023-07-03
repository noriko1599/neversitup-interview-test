import { IAppEvent } from '../event.interface';
import { FailedReservationDTO } from '@app/shared/dto/product/reserve-product.dto';

export const CreateOrderRequestFailedPattern = 'create_order_request_failed';

export type CreateOrderRequestFailedPayload = {
  failedProducts: FailedReservationDTO[];
};

export type CreateOrderRequestFailed = IAppEvent<
  'create_order_request_failed',
  CreateOrderRequestFailedPayload
>;
