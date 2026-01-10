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
}