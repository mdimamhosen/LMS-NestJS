/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserRole } from 'src/auth/registerUser.DTO';
 

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
  })
  username: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    validate: {
      validator: (v: string) => /^\S+@\S+\.\S+$/.test(v),
      message: (props) => `${props.value} is not a valid email!`,
    },
  })
  email: string;

  @Prop({
    required: true,
    minlength: 6,
    validate: {
      validator: (v: string) => /^(?=.*\d).{6,}$/.test(v),
      message: 'Password must be at least 6 characters long and contain at least one number',
    },
  })
  password: string;

  @Prop({
    default: UserRole.STUDENT,
    enum: UserRole,
  })
  role: UserRole;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
