import { Controller, Get, Post, Body, BadRequestException } from '@nestjs/common';
import { DuplicateService } from '../duplicate/duplicate.service';

@Controller('admin/duplicates')
export class AdminDuplicatesController {
  constructor(private readonly duplicateService: DuplicateService) {}

  @Get()
  async listAll() {
    const items = await this.duplicateService.findAll();
    return {
      duplicates: items.map((d) => ({
        _id: d._id.toString(),
        hash: d.hash,
        metadata: d.metadata,
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
