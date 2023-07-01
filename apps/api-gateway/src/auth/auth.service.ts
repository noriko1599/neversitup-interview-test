import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDTO } from './dto/login.dto';
import { RegisterDTO } from './dto/register.dto';
import { ValidateUser } from './dto/validateUser.dto';
import { User } from '@app/shared/entities/user/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(payload: ValidateUser): Promise<User | null> {
    const user = await this.userService
      .getUserRepository()
      .findOneBy({ username: payload.username });

    if (user && (await bcrypt.compare(payload.password, user.password))) {
      const result = { ...user, password: undefined };
      return result;
    }
    return null;
  }

  async login(payload: LoginDTO) {
    const dbUser = await this.userService
      .getUserRepository()
      .findOne({ where: { username: payload.username } });

    if (!dbUser || !(await bcrypt.compare(payload.password, dbUser.password))) {
      throw new UnauthorizedException();
    }

    return {
      jwt: await this.jwtService.signAsync({
        username: dbUser.username,
        sub: dbUser.id,
      }),
    };
  }

  async register(payload: RegisterDTO) {
    const encryptedPassword = await bcrypt.hash(payload.password, 10); // 10 is the saltRounds, you can adjust it as per your security requirement
    const createdUser = await this.userService
      .getUserRepository()
      .save({ ...payload, password: encryptedPassword });
    const result = { ...createdUser, password: undefined };
    return result;
  }
}
