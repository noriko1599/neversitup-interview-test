import { SuccessfulReservationDTO } from '@app/shared/dto/product/reserve-product.dto';
import { IAppEvent } from '../event.interface';
import { OrderItemProduct } from '@app/shared/entities/order/order-item-product';

export const ProductQuantityRestoreFromOrderPattern =
  'product_quantity_restored_from_order';

export type ProductQuantityRestoreFromOrderPayload = {
  orderId: number;
  products: OrderItemProduct[];
};

export type ProductQuantityRestoreFromOrder = IAppEvent<
  'product_quantity_restored_from_order',
  ProductQuantityRestoreFromOrderPayload
>;
