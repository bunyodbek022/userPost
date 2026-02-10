import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsMongoId } from 'class-validator';

export class CreateCommentDto {
    @ApiProperty({
        example: 'Juda ajoyib maqola!',
        description: 'Izoh matni',
    })
    @IsString()
    @IsNotEmpty()
    content: string;

    @ApiProperty({
        example: '66f123456789abcdef123456',
        description: 'Post ID',
    })
    @IsMongoId()
    @IsNotEmpty()
    post: string;
}
