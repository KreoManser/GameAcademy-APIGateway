// src/admin/admin.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GamesService } from '../games/games.service';
import { Game, GameSchema } from '../games/schemas/game.schema';
import { MinioModule } from '../minio/minio.module';
import { DuplicateModule } from '../duplicate/duplicate.module';
import { AdminGamesController } from './admin-games.controller';
import { AdminDuplicatesController } from './admin-duplicates.controller';
import { RMQModule } from 'nestjs-rmq';

@Module({
  imports: [MongooseModule.forFeature([{ name: Game.name, schema: GameSchema }]), MinioModule, DuplicateModule],
  controllers: [AdminGamesController, AdminDuplicatesController],
  providers: [GamesService],
})
export class AdminModule {}
