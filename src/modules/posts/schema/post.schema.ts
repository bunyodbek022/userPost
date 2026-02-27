import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Posts extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'Users', required: true })
  author: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Category' }] })
  categories: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Users' }] })
  likes: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Users' }] })
  dislikes: Types.ObjectId[];

  @Prop({ type: String })
  coverImage?: string;

  @Prop({ unique: true })
  slug: string;

  @Prop({ default: 'PUBLISHED', enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'] })
  status: string;

  @Prop({ default: 0 })
  views: number;

  @Prop({ type: [String] })
  tags: string[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Users' }] })
  reposts: Types.ObjectId[];
}

export const PostsSchema = SchemaFactory.createForClass(Posts);