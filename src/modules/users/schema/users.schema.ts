import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({timestamps : true})
export class Users extends Document {
  @Prop({ required: true, unique : true})
  userName: string;

  @Prop({ required: true })
  age: number;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

}

export const UsersSchema = SchemaFactory.createForClass(Users);
