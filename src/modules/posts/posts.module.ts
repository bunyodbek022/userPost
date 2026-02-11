import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Posts, PostsSchema } from './schema/post.schema';
import { Category, CategorySchema } from '../category/schema/category.schema';
import { Comment, CommentSchema } from '../comments/schema/comment.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Posts.name, schema: PostsSchema },
    { name: Category.name, schema: CategorySchema },
    { name: Comment.name, schema: CommentSchema },
  ])],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule { }
