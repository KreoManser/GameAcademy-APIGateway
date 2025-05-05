// projects/src/comments/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Название класса и collectionName — "User" и "users"
@Schema({ collection: 'users', timestamps: false })
export class User {
  @Prop({ required: true })
  displayName: string;

  @Prop({ required: true })
  role: string;

  // любые другие поля вам не нужны для populate
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
