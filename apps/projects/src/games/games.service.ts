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
    imageFiles?: Express.Multer.File[],
    videoFiles?: Express.Multer.File[],
  ): Promise<GameDocument> {
    const prefix = randomBytes(4).toString('hex') + '/';
    const modelsKeys: string[] = [];
    const imagesKeys: string[] = [];
    const videosKeys: string[] = [];

    // 1) Build files
    const dir = await unzipper.Open.buffer(gameBuffer);
    await Promise.all(
      dir.files.map(async (entry) => {
        if (entry.type !== 'File') return;
        const buf = await entry.buffer();
        const key = `${prefix}${entry.path}`;
        let contentType = 'application/octet-stream';
        if (/\.js(\.br)?$/.test(entry.path)) contentType = 'application/javascript';
        else if (/\.wasm(\.br)?$/.test(entry.path)) contentType = 'application/wasm';
        const contentEncoding = entry.path.endsWith('.br') ? 'br' : undefined;
        await this.minio.uploadBuild(key, buf, contentType, contentEncoding);
      }),
    );

    // 2) Models
    if (modelFiles) {
      for (const f of modelFiles) {
        const key = `${prefix}models/${f.originalname}`;
        await this.minio.uploadModel(key, f.buffer, f.mimetype);
        modelsKeys.push(key);
      }
    }
    // 3) Images
    if (imageFiles) {
      for (const f of imageFiles) {
        const key = `${prefix}images/${f.originalname}`;
        await this.minio.uploadImage(key, f.buffer, f.mimetype);
        imagesKeys.push(key);
      }
    }
    // 4) Videos
    if (videoFiles) {
      for (const f of videoFiles) {
        const key = `${prefix}videos/${f.originalname}`;
        await this.minio.uploadVideo(key, f.buffer, f.mimetype);
        videosKeys.push(key);
      }
    }

    // 5) Save to Mongo
    const game = new this.gameModel({
      ...createDto,
      prefix,
      models: modelsKeys,
      images: imagesKeys,
      videos: videosKeys,
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
