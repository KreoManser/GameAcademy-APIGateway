import 'multer';

export namespace GameCreate {
  export const topic = 'game.create.command';

  export class Request {
    title: string;
    description: string;
    gameBuffer: Buffer;
    models?: Express.Multer.File[];
  }

  export class Response {
    gameId: string;
  }
}
