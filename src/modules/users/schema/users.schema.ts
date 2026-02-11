import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
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

}

export const UsersSchema = SchemaFactory.createForClass(Users);
