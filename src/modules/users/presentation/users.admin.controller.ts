import { Body, Controller, Get, UseGuards, Post } from '@nestjs/common';
import { Roles } from '@/shared/auth/roles.decorator';
import { JwtAuthGuard } from '@/modules/auth/infra/guard/jwt.guard';
import { AdminCreateUserUseCase } from '../application/use-cases/admin-create-user.use-case';
import { CreateCitizenDto } from '../application/dto/create-citizen.dto';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEmail, IsEnum, IsIn, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';
import  { APP_ROLES, AppRole } from '../domain/entities/user.entity';
import { ListCitizenUsersUseCase } from '../application/use-cases/list-citizen-users.use-case';

class AdminCreateUserDto {
  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'gcm01' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ example: 'secret123', minLength: 4 })
  @IsOptional()
  @IsString()
  @MinLength(4)
  password?: string;

  @ApiProperty({ isArray: true, enum: APP_ROLES, example: ['CITIZEN'] })
  @IsArray()
  @IsIn(APP_ROLES, { each: true }) 
  roles!: AppRole[];

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

@UseGuards(JwtAuthGuard)
@Roles('ADMIN')
@ApiBearerAuth()
@ApiTags('Admin - Citizens')
@Controller('admin/citizens')
export class UsersAdminController {
  constructor(
    private readonly listCitizens: ListCitizenUsersUseCase,
    private readonly createUser: AdminCreateUserUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar cidadão (ADMIN)' })
  @ApiBody({
    type: AdminCreateUserDto,
    examples: {
      default: {
        value: { email: 'user@example.com', password: 'secret123', phone: '+55 11 99999-0000', roles: ['CITIZEN'] , },
      },
      police: {
        summary: 'Criar policial (username + PIN)',
        value: { username: 'gcm01', password: '654321', roles: ['POLICE'] },
      },
      admin: {
        summary: 'Criar admin',
        value: { email: 'admin2@example.com', password: 'adm123', roles: ['ADMIN'] },
      }
    },
  })
  @ApiCreatedResponse({
    description: 'Usuário criado',
    schema: { example: { userId: '...', email: 'user@example.com', roles: ['CITIZEN'] } },
  })
  create(@Body() dto: AdminCreateUserDto) {
    return this.createUser.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar cidadãos (ADMIN)' })
  @ApiOkResponse({
    description: 'Lista de cidadãos',
    schema: {
      example: [{ id: '...', email: 'user@example.com', createdAt: '2024-08-20T12:00:00.000Z' }],
    },
  })
  list() {
    return this.listCitizens.execute();
  }
}
