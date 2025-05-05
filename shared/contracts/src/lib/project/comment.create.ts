export namespace CommentCreate {
  export const topic = 'comment.create.command';
  export class Request {
    gameId: string;
    parent?: string;
    content: string;
    userId: string;
  }
  export class Response {
    _id: string;
    content: string;
    author: { displayName: string; role: string; _id: string };
    createdAt: string;
    parent?: string;
  }
}
