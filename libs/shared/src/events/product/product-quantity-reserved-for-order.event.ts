import { SuccessfulReservationDTO } from '@app/shared/dto/product/reserve-product.dto';
import { IAppEvent } from '../event.interface';

export const ProductQuantityReservedPattern = 'product_quantity_reserved';

export type ProductQuantityReservedPayload = {
  orderId: number;
  reservedProducts: SuccessfulReservationDTO[];
};

export type ProductQuantityReserved = IAppEvent<
  'product_quantity_reserved',
  ProductQuantityReservedPayload
>;
