// src/games/schemas/game.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GameDocument = Game & Document;

@Schema({ timestamps: true })
export class Game {
  @Prop({ required: true }) title: string;
  @Prop() description: string;
  @Prop({ required: true }) prefix: string; // "ae3f9f4c/"
  @Prop({ type: [String], default: [] }) models: string[]; // ключи в models-bucket
}

export const GameSchema = SchemaFactory.createForClass(Game);
