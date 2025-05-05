// projects/src/comments/schemas/comment.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';

export type CommentDocument = Comment & Document;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  author: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  gameId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Comment.name })
  parent?: Types.ObjectId;

  @Prop({ required: true })
  content: string;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
