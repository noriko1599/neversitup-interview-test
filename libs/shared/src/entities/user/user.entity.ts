import { Entity, Column } from 'typeorm';
import { AppBaseEntity } from '../entity';

@Entity()
export class User extends AppBaseEntity {
  @Column()
  displayName: string;

  @Column()
  username: string;

  @Column()
  password: string;
}
