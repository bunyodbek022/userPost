import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsMongoId } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ 
    example: 'Amir Temur', 
    description: 'Post sarlavhasi' 
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ 
    example: "U ulug' sarkarda bolgan", 
    description: 'Post mazmuni' 
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ 
    example: '6584f23e4d9b2a1234567890', 
    description: 'Foydalanuvchining ID raqami' 
  })
  @IsMongoId({ message: "Yaroqsiz author ID" })
  @IsNotEmpty()
  author: string;
}