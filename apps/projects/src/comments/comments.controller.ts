import { Controller, Body } from '@nestjs/common';
import { RMQRoute } from 'nestjs-rmq';
import { CommentCreate, CommentList } from '@shared/contracts';
import { CommentsService } from './comments.service';

@Controller()
export class CommentsController {
  constructor(private readonly svc: CommentsService) {}

  @RMQRoute(CommentCreate.topic)
  async create(@Body() dto: CommentCreate.Request & { userId: string }) {
    const { userId, ...commentDto } = dto;

    return this.svc.create(commentDto, userId);
  }

  @RMQRoute(CommentList.topic)
  async list(@Body() dto: CommentList.Request) {
    const comments = await this.svc.findByGame(dto.gameId);
    return { comments };
  }
}
