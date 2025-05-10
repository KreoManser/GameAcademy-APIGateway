import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Game, GameDocument } from './schemas/game.schema';
import { CreateGameDto } from './dto/create-game.dto';
import { MinioService } from '../minio/minio.service';
import * as unzipper from 'unzipper';
import { randomBytes } from 'crypto';
import multer from 'multer';
import { DuplicateService } from '../duplicate/duplicate.service';

@Injectable()
export class GamesService {
  constructor(
    @InjectModel(Game.name) private gameModel: Model<GameDocument>,
    private minio: MinioService,
    private duplicate: DuplicateService,
  ) {}

  async create(
    createDto: CreateGameDto,
    gameBuffer?: Buffer,
    modelFiles?: Express.Multer.File[],
    imageFiles?: Express.Multer.File[],
    videoFiles?: Express.Multer.File[],
    coverBuffer?: Buffer,
    coverName?: string,
    coverMime?: string,
    playable = false,
  ): Promise<GameDocument> {
    const prefix = randomBytes(4).toString('hex') + '/';
    const modelsKeys: string[] = [];
    const imagesKeys: string[] = [];
    const videosKeys: string[] = [];

    // 1) Билд WebGL
    if (playable && gameBuffer) {
      const { isDuplicate, record } = await this.duplicate.checkOrRegister(gameBuffer, `${createDto.title}-build.zip`, {
        type: 'build',
      });
      if (isDuplicate) {
        throw new ConflictException(`Duplicate build detected (id: ${record._id})`);
      }
      const dir = await unzipper.Open.buffer(gameBuffer);
      await Promise.all(
        dir.files.map(async (e) => {
          if (e.type !== 'File') return;
          const buf = await e.buffer();
          const key = `${prefix}${e.path}`;
          let ct = 'application/octet-stream';
          if (/\.js(\.br)?$/.test(e.path)) ct = 'application/javascript';
          else if (/\.wasm(\.br)?$/.test(e.path)) ct = 'application/wasm';
          const ce = e.path.endsWith('.br') ? 'br' : undefined;
          await this.minio.uploadBuild(key, buf, ct, ce);
        }),
      );
    }

    // 2) Модели
    if (modelFiles) {
      for (const f of modelFiles) {
        const { isDuplicate, record } = await this.duplicate.checkOrRegister(f.buffer, f.originalname, {
          type: 'model',
        });
        if (isDuplicate) {
          throw new ConflictException(`Duplicate model "${f.originalname}" (id: ${record._id})`);
        }
        const key = `${prefix}models/${f.originalname}`;
        await this.minio.uploadModel(key, f.buffer, f.mimetype);
        modelsKeys.push(key);
      }
    }

    // 3) Изображения
    if (imageFiles) {
      for (const f of imageFiles) {
        const key = `${prefix}images/${f.originalname}`;
        await this.minio.uploadImage(key, f.buffer, f.mimetype);
        imagesKeys.push(key);
      }
    }

    // 4) Видео
    if (videoFiles) {
      for (const f of videoFiles) {
        const key = `${prefix}videos/${f.originalname}`;
        await this.minio.uploadVideo(key, f.buffer, f.mimetype);
        videosKeys.push(key);
      }
    }

    // 5) Cover
    if (!coverBuffer || !coverName || !coverMime) {
      throw new NotFoundException('Cover missing');
    }
    const coverKey = `${prefix}cover/${coverName}`;
    await this.minio.uploadImage(coverKey, coverBuffer, coverMime);

    // 6) Сохраняем в Mongo
    const game = new this.gameModel({
      ...createDto,
      prefix,
      models: modelsKeys,
      images: imagesKeys,
      videos: videosKeys,
      cover: `${prefix}cover/${coverName}`,
      playable,
    });
    return game.save();
  }

  async findAll(q?: string, uploader?: string): Promise<GameDocument[]> {
    const filter: any = {};

    if (uploader) {
      filter.uploader = uploader;
    }

    if (q) {
      const regex = new RegExp(q, 'i');
      // Если одновременно есть uploader и q — поиск внутри его игр
      filter.$or = [{ title: regex }, { description: regex }, { genres: q }];
    }

    return this.gameModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<GameDocument> {
    const game = await this.gameModel.findById(id).exec();
    if (!game) throw new NotFoundException('Game not found');
    return game;
  }

  async remove(id: string): Promise<void> {
    const game = await this.gameModel.findByIdAndDelete(id).exec();
    if (!game) throw new NotFoundException('Game not found');
  }
}
