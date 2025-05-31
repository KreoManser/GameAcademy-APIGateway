import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createHash } from 'crypto';

import { Duplicate, DuplicateDocument } from './schemas/duplicate.schema';

@Injectable()
export class DuplicateService {
  constructor(
    @InjectModel(Duplicate.name)
    private readonly dupModel: Model<DuplicateDocument>,
  ) {}

  computeHash(buffer: Buffer): string {
    return createHash('sha256').update(buffer).digest('hex');
  }

  async checkOrRegister(buffer: Buffer, originalName?: string, metadata?: Record<string, any>) {
    const hash = this.computeHash(buffer);
    const existing = await this.dupModel.findOne({ hash });
    if (existing) {
      return { isDuplicate: true, record: existing };
    }
    const created = await this.dupModel.create({ hash, originalName, metadata });
    return { isDuplicate: false, record: created };
  }

  async findAll() {
    return this.dupModel.find().sort({ _id: -1 }).exec();
  }

  async remove(id: string): Promise<void> {
    await this.dupModel.findByIdAndDelete(id).exec();
  }
}
