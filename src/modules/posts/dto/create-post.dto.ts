import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray, IsMongoId, ArrayNotEmpty } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    example: 'Amir Temur hayoti',
    description: 'Post sarlavhasi',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: "U ulug' sarkarda bo'lgan va ...",
    description: 'Post mazmuni',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    example: ['66f123456789abcdef123456', '66f789abcdef123456789abc'],
    description: 'Kategoriyalar massivi (ObjectId lar)',
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  categories: string[];

  @ApiProperty({
    example: ['history', 'biography'],
    description: 'Post teglari',
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({
    example: 'PUBLISHED',
    description: 'Post holati (DRAFT, PUBLISHED, ARCHIVED)',
    required: false,
    enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
  })
  @IsString()
  status?: string;
}