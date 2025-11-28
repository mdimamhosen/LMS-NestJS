import { IsString, IsNotEmpty } from 'class-validator';

export class LoginUserDTO {
  @IsString()
  @IsNotEmpty()
  identifier: string; // username or email

  @IsString()
  @IsNotEmpty()
  password: string;
}
