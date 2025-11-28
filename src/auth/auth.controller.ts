/* eslint-disable prettier/prettier */
import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDTO } from './registerUser.DTO';
import { LoginUserDTO } from './loginUser.DTO';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    async register(@Body() registerUserDTO: RegisterUserDTO ,  @Res({ passthrough: true }) res: Response) {
     const response = await this.authService.registerUser(registerUserDTO);
         
      const token = response.access_token;
      res.cookie('jwt', token  , {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });
 
    return  response;
    }

    @Post('login')
    async login(@Body() loginDto: LoginUserDTO, @Res({ passthrough: true }) res: Response) {
      const response = await this.authService.loginUser(loginDto.identifier, loginDto.password);

      const token = response.access_token;
      res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'lax',
      });

      return response;
    }


}


