import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Users } from './schema/users.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(Users.name) private userModel: Model<Users>) {}
  async create(payload: CreateUserDto) {
    const existingEmail = await this.userModel.findOne({
      email: payload.email,
    });
    if (existingEmail) {
      throw new ConflictException("Bu email allaqachon ro'yxatdan o'tgan");
    }
    const existingUser = await this.userModel.findOne({ email: payload.userName });
    if (existingUser) {
      throw new ConflictException("Bu userName allaqachon ro'yxatdan o'tgan");
    }
    const hashedPassword = await bcrypt.hash(payload.password, 10);
    const newUser = new this.userModel({
      ...payload,
      password: hashedPassword,
    });
    await newUser.save();
    const { password, ...userObj } = newUser.toObject();
    return {
      success: true,
      data: userObj,
    };
  }

  async findAll() {
    const users = await this.userModel.find().select('-password').exec();
    return {
      success: true,
      data: users,
    };
  }

  async findOne(id: string) {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException('Bunday id dagi user topilmadi');
    }
    return {
      success: true,
      data: user,
    };
  }

  async update(id: string, payload: UpdateUserDto) {
    const updatedUser = await this.userModel.findByIdAndUpdate(id, payload, {
      new: true,
    });
    if (!updatedUser) {
      throw new NotFoundException('Bunday id dagi user topilmadi');
    }
    return {
      success: true,
      message: 'User muvaffaqqiyatli yngilandi',
      data: updatedUser,
    };
  }

  async remove(id: string) {
    const deletedUser = await this.userModel.findByIdAndDelete(id);
    if (!deletedUser) {
      throw new NotFoundException('Bunday id dagi user topilmadi');
    }
    return {
      success: true,
      data: deletedUser,
    };
  }
}
