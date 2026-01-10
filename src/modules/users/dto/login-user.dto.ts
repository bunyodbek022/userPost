import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class LoginUserDto{
    @ApiProperty({ example: 'john@example.com', description: 'Email manzili' })
      @IsEmail()
      email: string;
    
      @ApiProperty({ example: 'password123', description: 'Maxfiy parol' })
      @IsString()
      @MinLength(6)
      password: string;
}