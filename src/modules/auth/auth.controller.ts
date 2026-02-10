import { Controller, Post, Body, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import type { Response } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @ApiOperation({ summary: 'User login' })
    login(@Body() payload: LoginUserDto, @Res() res: Response) {
        return this.authService.login(payload, res);
    }

    @Post('register')
    @ApiOperation({ summary: 'User register' })
    @ApiResponse({ status: 201, description: 'User successfully registered.' })
    @ApiResponse({ status: 409, description: 'Email or Username already exists.' })
    register(@Body() payload: CreateUserDto) {
        return this.authService.register(payload);
    }
}
