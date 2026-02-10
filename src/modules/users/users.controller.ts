import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthGuard } from 'src/guard/auth.guard';
import { RolesGuard } from 'src/guard/role.guard';
import { Roles } from 'src/decorators/role.decorator';
import { UserRole } from 'src/common/enums/role.enum';
import { AuthUser } from 'src/common/interfaces/user.interface';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @UseGuards(AuthGuard, RolesGuard)
  @Get('profile')
  @ApiSecurity('cookie-auth-key')
  @ApiOperation({ summary: 'User profilini korish' })
  profile(@Req() req) {
    const user: AuthUser = req.user;
    return this.usersService.findOne(String(user.id));
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Get()
  @ApiSecurity('cookie-auth-key')
  @ApiOperation({ summary: 'Barcha userlarni korish' })
  @Roles('admin')
  @UseGuards(AuthGuard, RolesGuard)
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Get(':id')
  @ApiSecurity('cookie-auth-key')
  @ApiOperation({ summary: 'Bitta userni korish' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Patch(':id')
  @ApiSecurity('cookie-auth-key')
  @ApiOperation({ summary: 'Userni  yangilash' })
  update(@Param('id') id: string, @Body() payload: UpdateUserDto, @Req() req) {
    const user: AuthUser = req.user as AuthUser;
    return this.usersService.update(id, payload, user);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Delete(':id')
  @ApiSecurity('cookie-auth-key')
  @ApiOperation({ summary: 'Userni  ochirish' })
  remove(@Param('id') id: string, @Req() req) {
    const user: AuthUser = req.user as AuthUser;
    return this.usersService.removeUser(id, user);
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  @ApiSecurity('cookie-auth-key')
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return { message: "Siz muvaffaqiyatli logout bo'ldingiz" };
  }
}
