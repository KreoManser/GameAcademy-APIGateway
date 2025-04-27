import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
  CreateBucketCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as stream from 'stream';

@Injectable()
export class MinioService {
  private client: S3Client;
  private bucket: string;
  private modelsBucket: string;

  constructor() {
    const {
      MINIO_ENDPOINT,
      MINIO_ACCESS_KEY,
      MINIO_SECRET_KEY,
      MINIO_BUCKET,
      MINIO_MODELS_BUCKET,
      MINIO_FORCE_PATH_STYLE,
      MINIO_PROTOCOL,
    } = process.env;
    this.bucket = MINIO_BUCKET;
    this.modelsBucket = MINIO_MODELS_BUCKET;
    this.client = new S3Client({
      endpoint: `${MINIO_PROTOCOL}://${MINIO_ENDPOINT}`,
      region: 'us-east-1',
      credentials: {
        accessKeyId: MINIO_ACCESS_KEY,
        secretAccessKey: MINIO_SECRET_KEY,
      },
      forcePathStyle: MINIO_FORCE_PATH_STYLE === 'true',
    });
    // this.ensureBucketExists(this.bucket);
    // this.ensureBucketExists(this.modelsBucket);
  }

  async onModuleInit() {
    await this.ensureBucketExists(this.bucket);
    await this.ensureBucketExists(this.modelsBucket);
  }

  private async ensureBucketExists(name: string) {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: name }));
      return;
    } catch (err: any) {
      const status = err.$metadata?.httpStatusCode;
      const isNotFound = err.name === 'NotFound' || status === 404;
      const isRulesError = err.message?.includes('Rules evaluation failed');

      if (isNotFound) {
        await this.client.send(new CreateBucketCommand({ Bucket: name }));
        console.log(`✅ Created bucket ${name}`);
        return;
      }

      // Минё не позволяет даже HEAD проверить из-за политики —
      // считаем, что бакет есть, но политику игнорируем
      if (isRulesError) {
        console.warn(`Bucket "${name}" exists, but policy evaluation failed, continuing startup.`);
        return;
      }

      // Во всех прочих случаях — действительно ошибка
      throw new InternalServerErrorException(`MinIO bucket "${name}" check failed: ${err.message || err}`);
    }
  }

  async uploadObject(key: string, body: Buffer | stream.Readable, contentType: string, contentEncoding?: string) {
    const params: PutObjectCommandInput = {
      Bucket: this.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      // вместо entry.path — используем переданный contentEncoding
      ...(contentEncoding ? { ContentEncoding: contentEncoding } : {}),
    };
    try {
      await this.client.send(new PutObjectCommand(params));
    } catch (err: any) {
      throw new InternalServerErrorException(`MinIO upload error: ${err.message || err}`);
    }
  }

  async uploadModel(key: string, body: Buffer | stream.Readable, contentType: string) {
    const params: PutObjectCommandInput = {
      Bucket: this.modelsBucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    };
    await this.client.send(new PutObjectCommand(params));
  }

  getPublicUrl(key: string, forModels = false) {
    const { MINIO_ENDPOINT, MINIO_PROTOCOL } = process.env;
    const bucket = forModels ? this.modelsBucket : this.bucket;
    return `${MINIO_PROTOCOL}://${MINIO_ENDPOINT}/${bucket}/${key}`;
  }
}
