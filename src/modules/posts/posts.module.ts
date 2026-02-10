import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Posts, PostsSchema } from './schema/post.schema';
import { CategoryModule } from '../category/category.module';
import { Category, CategorySchema } from '../category/schema/category.schema';

@Module({
  imports : [MongooseModule.forFeature([{name: Posts.name, schema : PostsSchema}, { name: Category.name, schema: CategorySchema },])],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
