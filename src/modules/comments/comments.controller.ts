import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    UseGuards,
    Req,
    Query,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/guard/auth.guard';
import { AuthUser } from 'src/common/interfaces/user.interface';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) { }

    @UseGuards(AuthGuard)
    @ApiSecurity('cookie-auth-key')
    @Post()
    @ApiOperation({ summary: 'Izoh qoldirish' })
    create(@Body() dto: CreateCommentDto, @Req() req) {
        const user: AuthUser = req.user;
        return this.commentsService.create(dto, user);
    }

    @Get('post/:postId')
    @ApiOperation({ summary: 'Post izohlarini olish' })
    findByPost(
        @Param('postId') postId: string,
        @Query('page') page = '1',
        @Query('limit') limit = '20',
    ) {
        return this.commentsService.findByPost(postId, Number(page), Number(limit));
    }

    @UseGuards(AuthGuard)
    @ApiSecurity('cookie-auth-key')
    @Delete(':id')
    @ApiOperation({ summary: 'Izohni ochirish' })
    remove(@Param('id') id: string, @Req() req) {
        const user: AuthUser = req.user;
        return this.commentsService.remove(id, user);
    }
}
