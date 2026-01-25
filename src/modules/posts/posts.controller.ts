import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/guard/auth.guard';
import { RolesGuard } from 'src/guard/role.guard';
import { AuthUser } from 'src/common/interfaces/user.interface';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @ApiSecurity('cookie-auth-key')
  @Post()
  @ApiOperation({ summary: 'Yangi post yaratish' })
  @ApiResponse({ status: 201, description: 'Post yaratildi.' })
  create(@Body() dto: CreatePostDto, @Req() req) {
    const user: AuthUser = req.user;
    return this.postsService.create(dto, user);
  }

  @ApiSecurity('cookie-auth-key')
  @Post(':id/like')
  @ApiOperation({ summary: 'Postga like bosish yoki qaytarib olish' })
  @UseGuards(AuthGuard)
  async toggleLike(@Param('id') id: string, @Req() req) {
    const userId = req.user.id || req.user._id;
    return this.postsService.toggleLike(id, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Barcha postlarni korish (avtorlari bilan)' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search?: string,
  ) {
    return this.postsService.findAll(Number(page), Number(limit), search);
  }

  @ApiSecurity('cookie-auth-key')
  @Get('my')
  @UseGuards(AuthGuard)
  myPosts(@Req() req, @Query('page') page = '1', @Query('limit') limit = '10') {
    return this.postsService.findMyPosts(Number(page), Number(limit), req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID boyicha bitta postni olish' })
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @ApiSecurity('cookie-auth-key')
  @UseGuards(AuthGuard, RolesGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Postni tahrirlash' })
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Req() req,
  ) {
    const user: AuthUser = req.user;
    return this.postsService.updatePost(id, updatePostDto, user);
  }

  @ApiSecurity('cookie-auth-key')
  @UseGuards(AuthGuard, RolesGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Postni ochirish' })
  remove(@Param('id') id: string, @Req() req) {
    const user: AuthUser = req.user;
    return this.postsService.removePost(id, user);
  }
}
