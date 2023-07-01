import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { AppBaseEntity } from '../entity';

@Entity()
export class User extends AppBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  displayName: string;

  @Column()
  username: string;

  @Column()
  password: string;
}
