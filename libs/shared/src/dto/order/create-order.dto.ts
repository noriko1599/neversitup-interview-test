import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateOrderItemDTO {
  productId: number;

  @Min(1)
  quantity: number;
}

export class CreateOrderCustomerDTO {
  @IsOptional()
  uid: number;

  @Min(6)
  @IsOptional()
  name: string;

  @IsEmail()
  @IsOptional()
  email: string;

  @IsPhoneNumber('TH')
  phone: string;
}

export class CreateOrderShippingDTO {
  address: string;

  city: string;

  state: string;

  country: string;

  postalCode: string;
}

export class CreateOrderDTO {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDTO)
  items: CreateOrderItemDTO[];

  customer: CreateOrderCustomerDTO;

  @IsOptional()
  shipping: CreateOrderShippingDTO;
}
