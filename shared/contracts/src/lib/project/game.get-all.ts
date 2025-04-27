export namespace GameGetAll {
  export const topic = 'game.get-all.query';

  export class Request {}

  export class Response {
    games: {
      gameId: string;
      title: string;
      url: string;
    }[];
  }
}
