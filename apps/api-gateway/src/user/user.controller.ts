import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { HttpService } from '@nestjs/axios';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly httpService: HttpService,
  ) {}

  private orderHttpUrl = `http://localhost:3001`;

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req) {
    return await this.userService.getUserRepository().findOne({
      where: {
        id: req.user.id,
      },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders')
  async getUserOrders(@Req() req) {
    const { data } = await this.httpService
      .get(`${this.orderHttpUrl}/user/${req.user.id}`)
      .toPromise();

    return data;
  }
}
