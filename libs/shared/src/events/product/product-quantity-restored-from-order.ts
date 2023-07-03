import { SuccessfulReservationDTO } from '@app/shared/dto/product/reserve-product.dto';
import { IAppEvent } from '../event.interface';

export const ProductQuantityRestoreFromOrderPattern =
  'product_quantity_restored_from_order';

export type ProductQuantityRestoreFromOrderPayload = {
  orderId: number;
  reservedProducts: SuccessfulReservationDTO[];
};

export type ProductQuantityRestoreFromOrder = IAppEvent<
  'product_quantity_restored_from_order',
  ProductQuantityRestoreFromOrderPayload
>;
