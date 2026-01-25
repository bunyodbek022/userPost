import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { PostsModule } from './modules/posts/posts.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { CategoryModule } from './modules/category/category.module';


@Module({
  imports: [UsersModule, PostsModule, MongooseModule.forRoot(process.env.DATABASE_URL || 'mongodb://devstories_db:27017/devstories'),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.registerAsync({
  global: true,
  imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
    secret: configService.get<string>('JWT_SECRET'),
    signOptions: {
      expiresIn: configService.get('JWT_EXPIRATION_TIME', '1h'),
    },
    
  }),
  inject: [ConfigService],
}),
    CategoryModule
],
  controllers: [],
  providers: [],
})
export class AppModule {}
