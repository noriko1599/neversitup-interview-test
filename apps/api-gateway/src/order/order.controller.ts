import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CreateOrderDTO } from '@app/shared/dto/order/create-order.dto';
import { CancelOrderDTO } from '@app/shared/dto/order/cancel-order.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { User } from '@app/shared/entities/user/user.entity';
import { Response } from 'express';
@Controller('order')
export class OrderController {
  constructor(private readonly httpService: HttpService) {}
  private orderHttpUrl = `http://localhost:3001`;

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUserOrderDetail(@Param() params: { id: number }, @Req() req) {
    const { data } = await this.httpService
      .get(`${this.orderHttpUrl}/${params.id}`, {
        params: {
          userId: req.user.id,
        },
      })
      .toPromise();

    return data;
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() body: CreateOrderDTO, @Req() req, @Res() res: Response) {
    try {
      const user = req.user as User;

      const updatedBody: CreateOrderDTO = {
        ...body,
        customer: {
          ...body.customer,
          name: body.customer.name ?? user.displayName,
          uid: user.id,
        },
      };

      const { data } = await this.httpService
        .post(this.orderHttpUrl, updatedBody)
        .toPromise();

      res.status(HttpStatus.CREATED).send(data);
    } catch (error) {
      if (error.response.status == 400) {
        return res.status(error.response.status).send(error.response.data);
      }

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('cancel')
  async cancel(@Body() body: CancelOrderDTO, @Req() req) {
    const user = req.user as User;
    const updatedBody: CancelOrderDTO = {
      ...body,
      uid: user.id,
    };
    const { data } = await this.httpService
      .post(`${this.orderHttpUrl}/cancel`, updatedBody)
      .toPromise();

    return data;
  }
}
