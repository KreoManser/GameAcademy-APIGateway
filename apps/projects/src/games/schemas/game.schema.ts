import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type GameDocument = Game & Document;

@Schema({ timestamps: true })
export class Game {
  @Prop({ required: true }) title: string;

  @Prop() description: string;

  @Prop({ required: true }) prefix: string;

  @Prop({ type: [String], default: [] }) models: string[];

  @Prop({ type: [String], default: [] }) images: string[];

  @Prop({ type: [String], default: [] }) videos: string[];

  @Prop({ type: [String], default: [] }) genres: string[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  uploader: Types.ObjectId;

  @Prop({ required: true }) cover: string;

  @Prop() githubUrl?: string;

  @Prop({ default: false }) playable: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  authors: Types.ObjectId[];
}

export const GameSchema = SchemaFactory.createForClass(Game);
