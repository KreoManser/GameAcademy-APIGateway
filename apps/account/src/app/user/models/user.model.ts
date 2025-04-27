import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IUser, UserRole } from '@shared/interfaces';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User implements IUser {
  @Prop()
  displayName?: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({
    required: true,
    enum: UserRole,
    type: String,
    default: UserRole.Guest,
  })
  role: UserRole;
}

export const UserSchema = SchemaFactory.createForClass(User);
