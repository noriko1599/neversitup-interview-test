import { FailedReservationDTO } from '@app/shared/dto/product/reserve-product.dto';
import { IAppEvent } from '../event.interface';

export const ProductQuantityReservationForOrderFailedPattern =
  'product_quantity_reservation_for_order_failed';

export type ProductQuantityReservationForOrderFailedPayload = {
  orderId: number;
  failedProducts: FailedReservationDTO[];
};

export type ProductQuantityReservationForOrderFailed = IAppEvent<
  'product_quantity_reservation_for_order_failed',
  ProductQuantityReservationForOrderFailedPayload
>;
