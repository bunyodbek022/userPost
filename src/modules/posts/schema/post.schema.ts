import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';


@Schema()
export class Posts extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Users',
    required: true,
  })
  author: Types.ObjectId;;
}

export const PostsSchema = SchemaFactory.createForClass(Posts);
