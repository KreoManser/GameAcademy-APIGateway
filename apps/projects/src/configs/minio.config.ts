import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Global()
@Module({
  providers: [
    {
      provide: 'MINIO',
      useFactory: (cfg: ConfigService) => {
        return new Minio.Client({
          endPoint: cfg.get('MINIO_ENDPOINT'),
          port: parseInt(cfg.get('MINIO_PORT', '9000')),
          useSSL: false,
          accessKey: cfg.get('MINIO_ACCESS_KEY'),
          secretKey: cfg.get('MINIO_SECRET_KEY'),
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: ['MINIO'],
})
export class MinioModule {}
