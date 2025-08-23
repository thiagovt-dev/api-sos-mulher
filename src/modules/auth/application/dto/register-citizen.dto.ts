import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterCitizenDto {
  @ApiProperty({ example: 'maria@example.com', description: 'E-mail para login (obrigatório)' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'minhasenha123', minLength: 6, description: 'Senha (obrigatória)' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiPropertyOptional({ example: 'Maria da Silva' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '+55 11 99999-0000' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Rua A' })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiPropertyOptional({ example: '123' })
  @IsOptional()
  @IsString()
  number?: string;

  @ApiPropertyOptional({ example: 'Centro' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ example: 'São Paulo' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'SP' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: '12345-678' })
  @IsOptional()
  @IsString()
  zip?: string;

  @ApiPropertyOptional({ example: -23.55052 })
  @IsOptional()
  @IsNumber()
  lat?: number;

  @ApiPropertyOptional({ example: -46.633308 })
  @IsOptional()
  @IsNumber()
  lng?: number;
}

