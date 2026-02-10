import { Injectable, UnauthorizedException, InternalServerErrorException, Logger, ConflictException, HttpException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from '../users/dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import type { Response } from 'express';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) { }

    // Login logic moved from UsersService
    async login(payload: LoginUserDto, res: Response) {
        try {
            const user = await this.usersService.findByUsername(payload.userName);
            if (!user) {
                // To match original error message behavior or better, use unified credentials error
                throw new UnauthorizedException('User topilmadi yoki parol xato');
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
            if (error instanceof HttpException) throw error;
            this.logger.error(`Login error: ${error.message}`, error.stack);
            throw new InternalServerErrorException({
                message: 'User login qilishda xatolik yuz berdi',
                error,
            });
        }
    }

    async register(payload: CreateUserDto) {
        return this.usersService.register(payload);
    }
}
