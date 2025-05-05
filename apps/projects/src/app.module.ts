// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { getMongoConfig } from './configs/mongo.config';
import { GamesModule } from './games/games.module';
import { MinioModule } from './minio/minio.module';
import { CommentsModule } from './comments/comments.module';
import { getRMQConfig } from './configs/rmq.config';
import { RMQModule } from 'nestjs-rmq';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'envs/.projects.env',
    }),
    MongooseModule.forRootAsync(getMongoConfig()),
    RMQModule.forRootAsync(getRMQConfig()),
    MinioModule,
    CommentsModule,
    GamesModule,
  ],
})
export class AppModule {}
