import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DuplicateService } from './duplicate.service';

@Controller('duplicate')
export class DuplicateController {
  constructor(private readonly dup: DuplicateService) {}

  /**
   * Принимает файл в multipart/form-data под ключом `file`.
   * Возвращает { isDuplicate: boolean, record: Duplicate }
   */
  @Post()
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 50_000_000 } }))
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file || !file.buffer) {
      throw new BadRequestException('Файл не получен');
    }

    const metadata = {
      mimetype: file.mimetype,
      size: file.size,
    };

    return this.dup.checkOrRegister(file.buffer, file.originalname, metadata);
  }
}
