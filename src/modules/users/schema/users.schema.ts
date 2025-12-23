import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

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

export const UserSchema = SchemaFactory.createForClass(Users);
