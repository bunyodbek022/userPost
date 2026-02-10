import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { PostsModule } from './modules/posts/posts.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CategoryModule } from './modules/category/category.module';
import { AuthModule } from './modules/auth/auth.module';
import { CommentsModule } from './modules/comments/comments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('DATABASE_URL'),
      }),
      inject: [ConfigService],
    }),

    AuthModule,
    UsersModule,
    PostsModule,
    CategoryModule,
    CommentsModule,
  ],
})
export class AppModule { }

