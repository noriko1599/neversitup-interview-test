import {
  Controller,
  Request,
  Post,
  Body,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { RegisterDTO } from './dto/register.dto';
import { LoginDTO } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() body: LoginDTO) {
    return this.authService.login(body);
  }

  @Post('register')
  async register(@Body() body: RegisterDTO) {
    const registeredUser = await this.authService.register(body);
    if (!registeredUser) {
      throw new UnauthorizedException('Registration failed');
    }
    return registeredUser;
  }
}
