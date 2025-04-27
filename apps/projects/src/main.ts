/* eslint-disable @typescript-eslint/no-unsafe-call */
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // разрешаем запросы с фронтенда
  await app.listen(3001);
  console.log('Backend running on http://localhost:3001');
}
bootstrap();
