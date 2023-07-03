import { IAppEvent } from '../event.interface';
import { Product } from '@app/shared/entities/product/product.entity';

export const ProductCreatedPattern = 'product_created';

export type ProductCreatedPayload = {
  createdProduct: Product;
};

export type ProductCreated = IAppEvent<
  'product_created',
  ProductCreatedPayload
>;
