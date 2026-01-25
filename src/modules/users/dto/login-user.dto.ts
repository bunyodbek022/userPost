import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength, IsNotEmpty } from "class-validator";

export class LoginUserDto {
  @ApiProperty({ 
    example: 'bunyodbek123', 
    description: 'Foydalanuvchi nomi' 
  })
  @IsString({ message: 'userName matn shaklida bo\'lishi kerak' })
  @IsNotEmpty({ message: 'userName bo\'sh bo\'lishi mumkin emas' })
  userName: string;

  @ApiProperty({ 
    example: 'password123', 
    description: 'Maxfiy parol' 
  })
  @IsString({ message: 'Parol matn shaklida bo\'lishi kerak' })
  @MinLength(6, { message: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak' })
  password: string;
}