import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import { RegisterCitizenDto } from '../application/dto/register-citizen.dto';
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
import { PoliceLoginUseCase } from '../application/use-cases/police-login.use-case';
import { RegisterCitizenUseCase } from '@/modules/users/application/use-cases/register-citizen.use-case';

class RegisterResponseDto { id!: string; email!: string }

// Usamos RegisterDto com validação (@IsEmail, @MinLength)

class LoginResponseUserDto { id!: string; email!: string; roles?: string[] }

class LoginResponseDto {
  access_token!: string;
  user!: LoginResponseUserDto;
}

class PoliceLoginDto {
  login!: string;
  pin!: string;
}


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly policeLogin: PoliceLoginUseCase,
    private readonly registerCitizen: RegisterCitizenUseCase,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Cadastro de usuário' })
  @ApiBody({
    type: RegisterCitizenDto,
    examples: {
      exemplo: {
        summary: 'Cadastro simples',
        value: {
          email: 'maria@example.com',
          password: 'minhasenha123',
          name: 'Maria da Silva',
          phone: '+55 11 99999-0000',
          street: 'Rua A',
          number: '123',
          district: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          zip: '12345-678',
          lat: -23.55052,
          lng: -46.633308,
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Usuário criado com sucesso (retorna token JWT)',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  async register(@Body() dto: RegisterCitizenDto) {
    return this.registerCitizen.execute(dto);
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
          email: 'maria@example.com',
          roles: ['CITIZEN'],
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

  @Post('police/login')
  @ApiOperation({ summary: 'Login de policial por username + PIN' })
  @ApiBody({
    type: PoliceLoginDto,
    examples: {
      default: { value: { login: 'gcm01', pin: '654321' } },
    },
  })
  @ApiOkResponse({
    description: 'Token JWT emitido para policial',
    schema: { example: { access_token: 'eyJhbGciOi...' } },
  })
  police(@Body() dto: PoliceLoginDto) {
    return this.policeLogin.execute({ login: dto.login, pin: dto.pin });
  }
}
