import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class LoginUserDto{
    @ApiProperty({ example: 'username12', description: 'userName(Masalan bun6yoodbek123)' })
      @IsString()
      userName: string;
    
      @ApiProperty({ example: 'password123', description: 'Maxfiy parol' })
      @IsString()
      @MinLength(6)
      password: string;
}