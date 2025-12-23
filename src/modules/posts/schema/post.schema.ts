import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Users } from 'src/modules/users/schema/users.schema';

@Schema()
export class Posts extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  context: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Users',
    required: true,
  })
  author: Users;
}

export const PostsSchema = SchemaFactory.createForClass(Posts);
