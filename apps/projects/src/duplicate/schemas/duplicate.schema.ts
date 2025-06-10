import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

@Schema({ timestamps: true })
export class Duplicate {
  @Prop({ required: true, unique: true })
  zipHash: string;

  @Prop({ type: Map, of: String, default: {} })
  fileHashes: Record<string, string>;

  @Prop() author?: string;
  @Prop() productName?: string;

  @Prop({ type: SchemaTypes.Mixed, default: {} })
  metadata: Record<string, any>;
}

export type DuplicateDocument = Duplicate & Document;
export const DuplicateSchema = SchemaFactory.createForClass(Duplicate);
