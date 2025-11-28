import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { RegisterUserDTO } from './registerUser.DTO';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}

  async registerUser(registerUserDTO: RegisterUserDTO) {
    const hashedPassword = await bcrypt.hash(registerUserDTO.password, 10);

    const userData = {
      ...registerUserDTO,
      password: hashedPassword,
    };

    const user = await this.userService.createUser(userData);

    const payload = { sub: user._id };
    const token = await this.jwtService.signAsync(payload);

    return {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
      access_token: token,
    };
  }
  async loginUser(identifier: string, password: string) {
    const user = await this.userService.findByUsernameOrEmail(identifier);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user._id, username: user.username, role: user.role };
    const token = await this.jwtService.signAsync(payload);

    const userObj = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    return { user: userObj, access_token: token };
  }
}
