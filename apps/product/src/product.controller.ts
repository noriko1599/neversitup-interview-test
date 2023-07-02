import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { ReserveProductDTO } from '@app/shared/dto/product/reserve-product.dto';
import { FindProductDTO } from '@app/shared/dto/product/find-product.dto';

@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async find(@Query() query: FindProductDTO) {
    const { skip = 0, take = 10, sku } = query;

    const products = await this.productService
      .getProductRepository()
      .find({ where: { sku }, skip, take, order: { id: 'ASC' } });

    return products;
  }

  @Get(':id')
  async findOneById(@Param() params: { id: number }) {
    const { id } = params;

    const product = await this.productService
      .getProductRepository()
      .findOne({ where: { id } });

    return product;
  }

  @Post('reserveProducts')
  async reserveProducts(@Body() body: ReserveProductDTO) {
    const { items } = body;
    return await this.productService.reserveProducts(items);
  }
}
