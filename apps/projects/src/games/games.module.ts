import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Game, GameSchema } from './schemas/game.schema';
import { MinioModule } from '../minio/minio.module';
import { DuplicateModule } from '../duplicate/duplicate.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Game.name, schema: GameSchema }]), MinioModule, DuplicateModule],
  controllers: [GamesController],
  providers: [GamesService],
})
export class GamesModule {}
