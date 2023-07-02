import { IsOptional } from 'class-validator';

export class FindProductDTO {
  @IsOptional()
  skip: number;

  @IsOptional()
  take: number;

  @IsOptional()
  sku: string;
}
