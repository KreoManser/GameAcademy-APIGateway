export namespace CommentList {
  export const topic = 'account.list.query';
  export class Request {
    gameId: string;
  }
  export class Response {
    comments: Array<{
      _id: string;
      content: string;
      author: { displayName: string; role: string };
      createdAt: string;
      replies: any[];
    }>;
  }
}
