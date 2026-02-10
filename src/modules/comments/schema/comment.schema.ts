import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Comment extends Document {
    @Prop({ required: true })
    content: string;

    @Prop({ type: Types.ObjectId, ref: 'Users', required: true })
    author: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Posts', required: true })
    post: Types.ObjectId;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
