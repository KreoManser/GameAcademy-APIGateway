// src/games/games.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Game, GameDocument } from './schemas/game.schema';
import { CreateGameDto } from './dto/create-game.dto';
import { MinioService } from '../minio/minio.service';
import * as unzipper from 'unzipper';
import { randomBytes } from 'crypto';
import 'multer';

@Injectable()
export class GamesService {
  constructor(
    @InjectModel(Game.name) private gameModel: Model<GameDocument>,
    private minio: MinioService,
  ) {}

  async create(
    createDto: CreateGameDto,
    gameBuffer: Buffer,
    modelFiles?: Express.Multer.File[],
  ): Promise<GameDocument> {
    const prefix = randomBytes(4).toString('hex') + '/';

    // 1) Распаковываем и заливаем Build/
    const dir = await unzipper.Open.buffer(gameBuffer);
    await Promise.all(
      dir.files.map(async (entry) => {
        if (entry.type !== 'File') return;

        const buf = await entry.buffer();
        const key = `${prefix}${entry.path}`;

        // определяем Content-Type
        let contentType = 'application/octet-stream';
        if (entry.path.endsWith('.js') || entry.path.endsWith('.js.br')) {
          contentType = 'application/javascript';
        } else if (entry.path.endsWith('.wasm') || entry.path.endsWith('.wasm.br')) {
          contentType = 'application/wasm';
        }

        // определяем, был ли файл сжат Brotli
        const contentEncoding = entry.path.endsWith('.br') ? 'br' : undefined;

        // заливаем с указанием кодировки
        await this.minio.uploadObject(key, buf, contentType, contentEncoding);
      }),
    );

    // 2) Дополнительно заливаем модели в models-бакет
    const modelsKeys: string[] = [];
    if (modelFiles && modelFiles.length) {
      for (const file of modelFiles) {
        const key = `${prefix}models/${file.originalname}`;
        await this.minio.uploadModel(key, file.buffer, file.mimetype);
        modelsKeys.push(key);
      }
    }

    // 3) Сохраняем в Mongo
    const game = new this.gameModel({
      title: createDto.title,
      description: createDto.description,
      prefix,
      models: modelsKeys,
    });
    return game.save();
  }

  async findAll(): Promise<GameDocument[]> {
    return this.gameModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<GameDocument> {
    const game = await this.gameModel.findById(id).exec();
    if (!game) throw new NotFoundException('Game not found');
    return game;
  }
}
