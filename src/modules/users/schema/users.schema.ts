import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserRole } from 'src/common/enums/role.enum';

@Schema({ timestamps: true })
export class Users extends Document {
  @Prop({ required: true, unique: true })
  userName: string;

  @Prop({ required: true })
  age: number;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER,
  })
  role: UserRole;

  @Prop({ required: false })
  avatar: string;

  @Prop({ type: [Types.ObjectId], ref: 'Users', default: [] })
  followers: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Users', default: [] })
  following: Types.ObjectId[];

}

export const UsersSchema = SchemaFactory.createForClass(Users);
