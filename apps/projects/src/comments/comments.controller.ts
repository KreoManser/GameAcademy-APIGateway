// projects/src/comments/comments.controller.ts

import { Controller, Body } from '@nestjs/common';
import { RMQRoute, RMQValidate } from 'nestjs-rmq';
import { CommentCreate, CommentList } from '@shared/contracts';
import { CommentsService } from './comments.service';

@Controller()
export class CommentsController {
  constructor(private readonly svc: CommentsService) {}

  @RMQValidate()
  @RMQRoute(CommentCreate.topic)
  async create(@Body() dto: CommentCreate.Request & { userId: string }) {
    // отделяем userId, остальное — это CreateCommentDto
    const { userId, ...commentDto } = dto;

    // вызываем сервис с двумя аргументами
    return this.svc.create(commentDto, userId);
  }

  @RMQRoute(CommentList.topic)
  async list(@Body() dto: CommentList.Request) {
    const comments = await this.svc.findByGame(dto.gameId);
    return { comments };
  }
}
