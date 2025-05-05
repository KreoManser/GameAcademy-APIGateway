// src/comments/comments.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { CreateCommentDto } from './dtos/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(@InjectModel(Comment.name) private commentModel: Model<CommentDocument>) {}

  async create(dto: CreateCommentDto, userId: string) {
    const comment = new this.commentModel({
      author: new Types.ObjectId(userId),
      gameId: new Types.ObjectId(dto.gameId),
      parent: dto.parent ? new Types.ObjectId(dto.parent) : undefined,
      content: dto.content,
    });
    return comment.save();
  }

  async findByGame(gameId: string) {
    const docs = await this.commentModel
      .find({ gameId: new Types.ObjectId(gameId) })
      .sort({ createdAt: 1 })
      .populate('author', 'displayName role')
      .lean()
      .exec();

    // строим дерево: сначала все топ‑level, потом вложенные
    const map = new Map<string, any[]>();
    docs.forEach((c) => {
      const key = c.parent?.toString() || 'root';
      map.set(key, (map.get(key) || []).concat(c));
    });

    function build(parentId: string) {
      return (map.get(parentId) || []).map((c) => ({
        ...c,
        replies: build(c._id.toString()),
      }));
    }

    return build('root');
  }
}
