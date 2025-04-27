// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { getMongoConfig } from './configs/mongo.config'; // ваш helper
import { GamesModule } from './games/games.module';
import { MinioModule } from './minio/minio.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'envs/.projects.env',
    }),
    MongooseModule.forRootAsync(getMongoConfig()),
    MinioModule,
    GamesModule,
  ],
})
export class AppModule {}
