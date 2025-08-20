import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'maria@example.com', description: 'E-mail do usuário' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'minhasenha123', minLength: 6, description: 'Senha do usuário' })
  @IsString()
  @MinLength(6)
  password!: string;
}
