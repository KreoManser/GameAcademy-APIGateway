import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

@Schema()
export class Duplicate {
  @Prop({ required: true, unique: true })
  hash: string;

  @Prop({ type: SchemaTypes.Mixed, default: {} })
  metadata: Record<string, any>;
}

export type DuplicateDocument = Duplicate & Document;
export const DuplicateSchema = SchemaFactory.createForClass(Duplicate);
