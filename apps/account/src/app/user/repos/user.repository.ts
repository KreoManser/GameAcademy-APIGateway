import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserEntity } from '../entities/user.entity';
import { User } from '../models/user.model';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  async createUser(user: UserEntity) {
    const newUser = new this.userModel(user);
    return newUser.save();
  }

  async findUser(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async findUserById(id: string) {
    return this.userModel.findById(id).exec();
  }

  async updateUserByEmail(email: string, partialEntity: Partial<UserEntity>) {
    return this.userModel.findOneAndUpdate({ email }, partialEntity, {
      new: true,
    });
  }

  async updateUserById({ _id, ...rest }: UserEntity) {
    return this.userModel.updateOne({ _id }, { $set: { ...rest } }).exec();
  }

  async deleteUser(email: string) {
    return this.userModel.deleteOne({ email }).exec();
  }
}
