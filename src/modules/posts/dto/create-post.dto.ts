import { IsMongoId, IsNotEmpty, IsString } from "class-validator";

export class CreatePostDto {
    @IsString()
    @IsNotEmpty({ message: "Sarlavha bo'sh bo'lishi mumkin emas" })
    title: string

    @IsString()
    context: string;

    @IsMongoId({ message: 'Author maydoni haqiqiy MongoDB ID bolishi kerak' })
    @IsNotEmpty()
    author: string
}
