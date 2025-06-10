import { Controller, Get, Post, Body, BadRequestException } from '@nestjs/common';
import { DuplicateService } from '../duplicate/duplicate.service';
import { Types } from 'mongoose';

@Controller('admin/duplicates')
export class AdminDuplicatesController {
  constructor(private readonly duplicateService: DuplicateService) {}

  @Get()
  async listAll() {
    const items = await this.duplicateService.findAll();
    return {
      duplicates: items.map((d) => ({
        _id: d._id.toString(),
        zipHash: d.zipHash,
        author: d.author,
        productName: d.productName,
        fileHashes: d.fileHashes,
        metadata: d.metadata,

        createdAt: ((d.get('createdAt') as Date | undefined) ?? (d._id as Types.ObjectId).getTimestamp()).toISOString(),
      })),
    };
  }

  @Post('delete')
  async delete(@Body('id') id: string) {
    if (!id) throw new BadRequestException('Id required');
    await this.duplicateService.remove(id);
    return { success: true };
  }
}
