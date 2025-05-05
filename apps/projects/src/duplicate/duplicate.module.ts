// src/duplicate/duplicate.module.ts
import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Duplicate, DuplicateSchema } from './schemas/duplicate.schema';
import { DuplicateService } from './duplicate.service';

@Global()
@Module({
  imports: [MongooseModule.forFeature([{ name: Duplicate.name, schema: DuplicateSchema }])],
  providers: [DuplicateService],
  exports: [DuplicateService],
})
export class DuplicateModule {}
