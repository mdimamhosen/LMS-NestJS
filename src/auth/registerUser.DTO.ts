/* eslint-disable prettier/prettier */
import { IsEmail, IsString, IsEnum, IsNotEmpty, Matches } from 'class-validator';

export enum UserRole {
  STUDENT = 'STUDENT',
  INSTRUCTOR = 'INSTRUCTOR',
  ADMIN = 'ADMIN',
}

export class RegisterUserDTO {
  @IsString({ message: 'Username must be a string' })
  @IsNotEmpty({ message: 'Username is required' })
  username: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @Matches(/^(?=.*\d).{6,}$/, {
    message: 'Password must be at least 6 characters long and contain at least one number',
  })
  password: string;

  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsEnum(UserRole, { message: 'Role must be one of STUDENT, INSTRUCTOR, or ADMIN' })
  role: UserRole;
}