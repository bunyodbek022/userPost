import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { PostsModule } from './modules/posts/posts.module';
import { MongooseModule } from '@nestjs/mongoose';


@Module({
  imports: [UsersModule, PostsModule, MongooseModule.forRoot('mongodb://localhost:27017/posts')],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
