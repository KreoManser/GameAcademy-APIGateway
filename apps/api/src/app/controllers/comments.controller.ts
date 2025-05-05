// api/src/controllers/comments.controller.ts
import { Controller, Post, Get, Body, Query, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { RMQService } from 'nestjs-rmq';
import { JWTAuthGuard } from '../guards/jwt.guard';
import { CommentCreate, CommentList } from '@shared/contracts';
import type { Request } from 'express';

@Controller('comments')
export class CommentsController {
  constructor(private readonly rmq: RMQService) {}

  @UseGuards(JWTAuthGuard)
  @Post()
  async create(@Body() dto: CommentCreate.Request, @Req() req: Request): Promise<CommentCreate.Response> {
    // req.user — здесь просто строка userId
    const userId = req.user as string;

    if (!dto.content.trim()) {
      throw new UnauthorizedException('Пустой комментарий');
    }

    return this.rmq.send<CommentCreate.Request, CommentCreate.Response>(CommentCreate.topic, { ...dto, userId });
  }

  @UseGuards(JWTAuthGuard)
  @Get()
  async list(@Query('gameId') gameId: string): Promise<CommentList.Response> {
    return this.rmq.send<CommentList.Request, CommentList.Response>(CommentList.topic, { gameId });
  }
}
