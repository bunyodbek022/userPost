import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Users } from './schema/users.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import { UserRole } from 'src/common/enums/role.enum';
import { AuthUser } from 'src/common/interfaces/user.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(Users.name) private userModel: Model<Users>,
    private jwtService: JwtService,
  ) {}
  async register(payload: CreateUserDto) {
    try {
      const existingEmail = await this.userModel.findOne({
        email: payload.email,
      });
      if (existingEmail) {
        throw new ConflictException("Bu email allaqachon ro'yxatdan o'tgan");
      }
      const existingUser = await this.userModel.findOne({
        email: payload.userName,
      });
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
    } catch (error) {
      console.log(error);
      if (error.code === 11000) {
        const duplicateField = Object.keys(error.keyPattern)[0];
        throw new ConflictException(`${duplicateField} already exists`);
      }
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException({
        message: 'User register qilishda xatolik yuz berdi ',
        error,
      });
    }
  }

  async login(payload: LoginUserDto, res: Response) {
    try {
      const user = await this.userModel.findOne({ userName: payload.userName });
      if (!user) {
        throw new NotFoundException('User topilmadi. Iltimos register qiling');
      }

      const isMatch = await bcrypt.compare(payload.password, user.password);
      if (!isMatch) {
        throw new UnauthorizedException('email yoki password xato');
      }
      const token = this.jwtService.sign({
        sub: user._id.toString(),
        role: user.role,
        email: user.email,
      });
      const isProduction = process.env.NODE_ENV === 'production';

      res.cookie('accessToken', token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
        maxAge: 1000 * 60 * 60,
      });

      res.send({
        success: true,
        message: 'User login successfully',
      });
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException({
        message: 'User login qilishda xatolik yuz berdi ',
        error,
      });
    }
  }
  async findAll() {
    try {
      const users = await this.userModel.find().select('-password').exec();
      return {
        success: true,
        data: users,
      };
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException({
        message: 'Userlarni qidiruvida xatolik yuz berdi ',
        error,
      });
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.userModel.findById(id).select('-password').exec();
      if (!user) {
        throw new NotFoundException('Bunday id dagi user topilmadi');
      }
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException({
        message: 'User qidiruvida qilishda xatolik yuz berdi ',
        error,
      });
    }
  }

  async update(id: string, payload: UpdateUserDto, currentUser: AuthUser) {
    try {
      const isAdmin = currentUser.role === UserRole.ADMIN;
      const isModerator = currentUser.role === UserRole.MODERATOR;
      const isSelf = id === String(currentUser.id);

      if (!isAdmin && !isModerator && !isSelf) {
        throw new ForbiddenException(
          "Sizda boshqa foydalanuvchi ma'lumotlarini o'zgartirish huquqi yo'q",
        );
      }
      if (isModerator) {
        const targetUser = await this.userModel.findById(id);
        if (!targetUser) throw new ForbiddenException('User topilmadi');

        if (targetUser.role === UserRole.ADMIN) {
          throw new ForbiddenException("Moderator adminni o'zgartira olmaydi");
        }
      }
      if (payload.email) {
        const existing = await this.userModel.findOne({ email: payload.email });
        if (existing && existing._id.toString() !== id) {
          throw new BadRequestException('Email allaqachon mavjud');
        }
      }

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
    } catch (error) {
      console.log(error);
      if (error.code === 11000) {
        const duplicateField = Object.keys(error.keyPattern)[0];
        throw new ConflictException(`${duplicateField} already exists`);
      }
      
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException({
        message: 'User update qilishda xatolik yuz berdi ',
        error,
      });
    }
  }

  async removeUser(targetUserId: string, currentUser: AuthUser) {
    try {
      const isAdmin = currentUser.role === UserRole.ADMIN;
    const isModerator = currentUser.role === UserRole.MODERATOR;
      const isSelf = targetUserId === String(currentUser.id);
      
      if (!isAdmin && !isModerator && !isSelf) {
      throw new ForbiddenException(
        "Sizda boshqa foydalanuvchini o'chirish huquqi yo'q",
      );
      }
      if (isModerator) {
      const targetUser = await this.userModel.findById(targetUserId);
      if (!targetUser) throw new NotFoundException('User topilmadi');

      if (targetUser.role === UserRole.ADMIN) {
        throw new ForbiddenException(
          "Moderator adminni o'chira olmaydi",
        );
      }
    }
      const deletedUser = await this.userModel.findByIdAndDelete(targetUserId);
    if (!deletedUser) throw new NotFoundException('User topilmadi');
      return {
        success: true,
        message: "User muvaffaqiyatli o'chirildi"
      };
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException({
        message: 'User delete qilishda xatolik yuz berdi ',
        error,
      });
    }
  }
  
}
