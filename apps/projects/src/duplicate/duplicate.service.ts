// projects/src/duplicate/duplicate.service.ts

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

  /** Вычислить SHA256 хеш */
  computeHash(buffer: Buffer): string {
    return createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Проверяет файл на дубли.
   * Если дубликат найден — возвращает его сущность.
   * Иначе — создаёт новую запись.
   */
  async checkOrRegister(buffer: Buffer, originalName?: string, metadata?: Record<string, any>) {
    const hash = this.computeHash(buffer);
    // ищем уже существующий
    const existing = await this.dupModel.findOne({ hash });
    if (existing) {
      return { isDuplicate: true, record: existing };
    }
    // иначе создаём
    const created = await this.dupModel.create({ hash, originalName, metadata });
    return { isDuplicate: false, record: created };
  }
}
