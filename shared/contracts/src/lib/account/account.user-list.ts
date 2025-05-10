export namespace UserList {
  export const topic = 'users.list';
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export type Request = {};
  export type Response = { users: { email: string; displayName: string; role: string }[] };
}
