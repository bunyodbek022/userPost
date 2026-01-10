import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,

  IsString,
  MinLength,
} from 'class-validator';


export class CreateUserDto {
  @ApiProperty({ example: 'johndoe', description: 'Foydalanuvchi nomi' })
  @IsString()
  @IsNotEmpty()
  userName: string;

  @ApiProperty({ example: 25, description: 'Foydalanuvchi yoshi' })
  @IsNumber()
  @IsNotEmpty()
  age: number;

  @ApiProperty({ example: 'john@example.com', description: 'Email manzili' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'Maxfiy parol' })
  @IsString()
  @MinLength(6)
  password: string;
}
