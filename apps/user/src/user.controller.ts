import { Controller, Post, Put, Delete, Get } from '@nestjs/common';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(): string {
    return '';
  }

  @Put()
  update(): string {
    return '';
  }

  @Delete()
  delete(): string {
    return '';
  }

  @Get()
  find(): [] {
    return [];
  }
}
