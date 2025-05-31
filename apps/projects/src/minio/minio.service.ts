import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
  CreateBucketCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import { Injectable, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import * as stream from 'stream';

@Injectable()
export class MinioService implements OnModuleInit {
  private client: S3Client;
  private bucket: string;
  private modelsBucket: string;
  private imagesBucket: string;
  private videosBucket: string;

  constructor() {
    const {
      MINIO_ENDPOINT,
      MINIO_ACCESS_KEY,
      MINIO_SECRET_KEY,
      MINIO_BUCKET,
      MINIO_MODELS_BUCKET,
      MINIO_IMAGES_BUCKET,
      MINIO_VIDEOS_BUCKET,
      MINIO_FORCE_PATH_STYLE,
      MINIO_PROTOCOL,
    } = process.env;
    this.bucket = MINIO_BUCKET;
    this.modelsBucket = MINIO_MODELS_BUCKET;
    this.imagesBucket = MINIO_IMAGES_BUCKET;
    this.videosBucket = MINIO_VIDEOS_BUCKET;
    this.client = new S3Client({
      endpoint: `${MINIO_PROTOCOL}://${MINIO_ENDPOINT}`,
      region: 'us-east-1',
      credentials: {
        accessKeyId: MINIO_ACCESS_KEY,
        secretAccessKey: MINIO_SECRET_KEY,
      },
      forcePathStyle: MINIO_FORCE_PATH_STYLE === 'true',
    });
  }

  async onModuleInit() {
    for (const name of [this.bucket, this.modelsBucket, this.imagesBucket, this.videosBucket]) {
      await this.ensureBucketExists(name);
    }
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
      if (isRulesError) {
        console.warn(`Bucket "${name}" exists with policy error, continuing.`);
        return;
      }
      throw new InternalServerErrorException(`MinIO bucket "${name}" check failed: ${err.message}`);
    }
  }

  async uploadObject(
    bucketName: string,
    key: string,
    body: Buffer | stream.Readable,
    contentType: string,
    contentEncoding?: string,
  ) {
    const params: PutObjectCommandInput = {
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
      ...(contentEncoding ? { ContentEncoding: contentEncoding } : {}),
    };
    try {
      await this.client.send(new PutObjectCommand(params));
    } catch (err: any) {
      throw new InternalServerErrorException(`MinIO upload error: ${err.message}`);
    }
  }

  uploadBuild(key: string, body: Buffer, contentType: string, contentEncoding?: string) {
    return this.uploadObject(this.bucket, key, body, contentType, contentEncoding);
  }
  uploadModel(key: string, body: Buffer, contentType: string) {
    return this.uploadObject(this.modelsBucket, key, body, contentType);
  }
  uploadImage(key: string, body: Buffer, contentType: string) {
    return this.uploadObject(this.imagesBucket, key, body, contentType);
  }
  uploadVideo(key: string, body: Buffer, contentType: string) {
    return this.uploadObject(this.videosBucket, key, body, contentType);
  }

  getPublicUrl(key: string, bucket: 'build' | 'models' | 'images' | 'videos' = 'build') {
    const { MINIO_ENDPOINT, MINIO_PROTOCOL } = process.env;
    const buckets = {
      build: this.bucket,
      models: this.modelsBucket,
      images: this.imagesBucket,
      videos: this.videosBucket,
    };
    const b = buckets[bucket];
    return `${MINIO_PROTOCOL}://${MINIO_ENDPOINT}/${b}/${key}`;
  }
}
