import { Product } from '@app/shared/entities/product/product.entity';
import { Type } from 'class-transformer';
import { IsArray, Min, ValidateNested } from 'class-validator';

export class ReserveProductItemDTO {
  productId: number;
  @Min(1)
  quantity: number;
}

export class ReserveProductDTO {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReserveProductItemDTO)
  items: ReserveProductItemDTO[];
}

export class FailedReservationDTO {
  productId: number;
  reason: string;
}

export class SuccessfulReservationDTO {
  product: Product;
  reservedQuantity: number;
}

export class ReserveProductResponseDTO {
  failedReservations: FailedReservationDTO[];
  successfulReservations: SuccessfulReservationDTO[];
}
