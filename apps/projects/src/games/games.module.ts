// src/games/games.module.ts
import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Game, GameSchema } from './schemas/game.schema';
import { MinioModule } from '../minio/minio.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Game.name, schema: GameSchema }]), MinioModule],
  controllers: [GamesController],
  providers: [GamesService],
})
export class GamesModule {}
