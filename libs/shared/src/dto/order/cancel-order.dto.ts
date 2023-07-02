import { IsOptional } from 'class-validator';

// cancel-order.dto.ts
export class CancelOrderDTO {
  @IsOptional()
  uid: number;

  orderId: number;

  reason: string;
}
