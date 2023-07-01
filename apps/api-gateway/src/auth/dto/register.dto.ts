import { IsString, Min, IsStrongPassword } from 'class-validator';

export class RegisterDTO {
  @IsString()
  displayName: string;

  @IsString()
  username: string;

  @IsString()
  password: string;
}
