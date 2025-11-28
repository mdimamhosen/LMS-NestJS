/* eslint-disable prettier/prettier */
import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { RegisterUserDTO } from 'src/auth/registerUser.DTO';
import { User } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) {}
   async createUser(registerUserDTO: RegisterUserDTO) {
  try {
    return await this.userModel.create(registerUserDTO);
  } catch (error: unknown) {
    type MongoDuplicateKeyError = { code?: number; keyPattern?: Record<string, unknown>; keyValue?: Record<string, unknown> };
    const err = error as MongoDuplicateKeyError;

    const mongoDuplicateKeyErrorCode = 11000;

    if (err.code === mongoDuplicateKeyErrorCode) {
      const duplicateField =
        err.keyPattern ? Object.keys(err.keyPattern)[0] : err.keyValue ? Object.keys(err.keyValue)[0] : 'value';

        throw new ConflictException(`${duplicateField} already exists`);
    }
    
    
     throw new InternalServerErrorException('Something went wrong while creating the user');
  }
}

    async findByUsernameOrEmail(identifier: string) {
      return this.userModel.findOne({ $or: [{ username: identifier }, { email: identifier }] }).exec();
    }
}

