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
  UseInterceptors,
  UploadedFile,
  ParseArrayPipe,
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
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) { }
  @UseGuards(AuthGuard, RolesGuard)
  @ApiSecurity('cookie-auth-key')
  @UseInterceptors(
    FileInterceptor('coverImage', {
      storage: diskStorage({
        destination: './uploads/posts', // serverda papka yaratilishi kerak
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(new Error('Faqat rasm fayllari qabul qilinadi!'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    }),
  )
  @Post()
  @ApiOperation({ summary: 'Yangi post yaratish' })
  @ApiResponse({ status: 201, description: 'Post yaratildi.' })
  create(@Body('title') title: string,
    @Body('content') content: string,
    @Body('categories', new ParseArrayPipe({ items: String, separator: ',' })) categories: string[],
    @UploadedFile() file: Express.Multer.File, @Req() req) {
    const user: AuthUser = req.user;
    let coverImagePath: string | undefined;
    if (file) {
      coverImagePath = `/uploads/posts/${file.filename}`;
    }
    const payloadWithImage = {
      title,
      content,
      categories,
      coverImage: coverImagePath,
    };
    return this.postsService.create(payloadWithImage, user);
  }

  @ApiSecurity('cookie-auth-key')
  @Post(':id/like')
  @ApiOperation({ summary: 'Postga like bosish yoki qaytarib olish' })
  @UseGuards(AuthGuard)
  async toggleLike(@Param('id') id: string, @Req() req) {
    const userId = req.user.id || req.user._id;
    return this.postsService.toggleLike(id, userId);
  }

  @ApiSecurity('cookie-auth-key')
  @Post(':id/dislike')
  @ApiOperation({ summary: 'Postga dislike bosish yoki qaytarib olish' })
  @UseGuards(AuthGuard)
  async toggleDislike(@Param('id') id: string, @Req() req) {
    const userId = req.user.id || req.user._id;
    return this.postsService.toggleDislike(id, userId);
  }

  @Get()
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('author') author?: string,
    @Query('sort') sort?: string,
  ) {
    return this.postsService.findAll(
      Number(page),
      Number(limit),
      search,
      category,
      author,
      sort,
    );
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
