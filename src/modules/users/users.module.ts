import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Users, UsersSchema } from './schema/users.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports : [MongooseModule.forFeature([{name: Users.name, schema : UsersSchema}])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
