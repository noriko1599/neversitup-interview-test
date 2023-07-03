import { SuccessfulReservationDTO } from '@app/shared/dto/product/reserve-product.dto';
import { IAppEvent } from '../event.interface';

export const ProductQuantityReservedForOrderPattern =
  'product_quantity_reserved_for_order';

export type ProductQuantityReservedForOrderPayload = {
  orderId: number;
  reservedProducts: SuccessfulReservationDTO[];
};

export type ProductQuantityReservedForOrder = IAppEvent<
  'product_quantity_reserved_for_order',
  ProductQuantityReservedForOrderPayload
>;
