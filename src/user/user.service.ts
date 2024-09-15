import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dtos/create-user.dto';
import { User } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdCat = await this.userModel.create(createUserDto);
    return createdCat;
  }

  async findOne(id: string): Promise<User> {
    return this.userModel.findById({ _id: id }).exec();
  }

  async findByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByGoogleId(id: string): Promise<User> {
    return this.userModel
      .findOne({
        oauthAccounts: { $elemMatch: { provider: 'google', id } },
      })
      .exec();
  }
}
