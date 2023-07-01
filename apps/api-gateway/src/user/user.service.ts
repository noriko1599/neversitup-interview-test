import { Injectable } from '@nestjs/common';
import { User } from '@app/shared/entities/user/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  getUserRepository() {
    return this.usersRepository;
  }
}
