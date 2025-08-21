import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import { RegisterDto } from '../application/dto/register.dto';
import { LoginDto } from '../application/dto/login.dto';
import { JwtAuthGuard } from '../infra/guard/jwt.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiCreatedResponse,
} from '@nestjs/swagger';

class RegisterResponseDto {
  id!: string;
  name!: string;
  email!: string;
}

class LoginResponseUserDto {
  id!: string;
  name!: string;
  email!: string;
}

class LoginResponseDto {
  access_token!: string;
  user!: LoginResponseUserDto;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Cadastro de usuário' })
  @ApiBody({
    type: RegisterDto,
    examples: {
      exemplo: {
        summary: 'Cadastro simples',
        value: { name: 'Maria Silva', email: 'maria@example.com', password: 'minhasenha123' },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Usuário criado com sucesso',
    type: RegisterResponseDto,
    schema: {
      example: {
        id: 'b6f7c1d2-5a0e-4b21-9a3f-1e2d3c4b5a6f',
        name: 'Maria Silva',
        email: 'maria@example.com',
      },
    },
  })
  async register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @HttpCode(200)
  @Post('login')
  @ApiOperation({ summary: 'Login' })
  @ApiBody({
    type: LoginDto,
    examples: {
      default: {
        value: { email: 'maria@example.com', password: 'minhasenha123' },
      },
    },
  })
  @ApiOkResponse({
    description: 'Login bem-sucedido',
    type: LoginResponseDto,
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 'b6f7c1d2-5a0e-4b21-9a3f-1e2d3c4b5a6f',
          name: 'Maria Silva',
          email: 'maria@example.com',
        },
      },
    },
  })
  async login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('protected')
  @ApiOperation({ summary: 'Exemplo de rota protegida' })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Retorna dados do usuário no token',
    schema: {
      example: {
        ok: true,
        user: { userId: 'b6f7c1d2-5a0e-4b21-9a3f-1e2d3c4b5a6f', email: 'maria@example.com' },
      },
    },
  })
  me(@Req() req: any) {
    return { ok: true, user: req.user };
  }
}
