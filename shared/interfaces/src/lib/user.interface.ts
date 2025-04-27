import { Types } from 'mongoose';

export enum UserRole {
  Guest = 'Guest',
  Teacher = 'Teacher',
  Student = 'Student',
  Admin = 'Admin',
}

export interface IUser {
  _id?: Types.ObjectId;
  displayName?: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}
