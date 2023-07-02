import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { HttpService } from '@nestjs/axios';
import { FindProductDTO } from '@app/shared/dto/product/find-product.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly httpService: HttpService) {}
  private productHttpUrl = `http://localhost:3002`;

  @Get()
  async find(@Query() query: FindProductDTO) {
    const { data } = await this.httpService
      .get(this.productHttpUrl, { params: query })
      .toPromise();

    return data;
  }

  @Get(':id')
  async findOneById(@Param() params: { id: number }) {
    const { data } = await this.httpService
      .get(`${this.productHttpUrl}/${params.id}`)
      .toPromise();

    return data;
  }
}
