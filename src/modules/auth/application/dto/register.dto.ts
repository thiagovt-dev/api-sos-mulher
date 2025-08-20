import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Maria Silva', description: 'Nome completo do usuário' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'maria@example.com', description: 'E-mail para login' })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'minhasenha123',
    minLength: 6,
    description: 'Senha com no mínimo 6 caracteres',
  })
  @IsString()
  @MinLength(6)
  password!: string;
}
