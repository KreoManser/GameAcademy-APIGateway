// src/duplicate/schemas/duplicate.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

@Schema()
export class Duplicate {
  @Prop({ required: true, unique: true })
  hash: string;

  // Явно говорим Мongoose, что metadata — это Mixed (любой «сырый» JS-объект)
  @Prop({ type: SchemaTypes.Mixed, default: {} })
  metadata: Record<string, any>;
}

export type DuplicateDocument = Duplicate & Document;
export const DuplicateSchema = SchemaFactory.createForClass(Duplicate);
