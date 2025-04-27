import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './models/user.model';
import { UserRepository } from './repos/user.repository';
import { UserCommands } from './user.commands';
import { UserQueries } from './user.quries';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  providers: [UserRepository],
  exports: [UserRepository],
  controllers: [UserCommands, UserQueries],
})
export class UserModule {
  name: string;
}
