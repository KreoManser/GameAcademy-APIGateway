import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'users', timestamps: false })
export class User {
  @Prop({ required: true })
  displayName: string;

  @Prop({ required: true })
  role: string;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
