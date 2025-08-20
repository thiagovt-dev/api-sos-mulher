import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { IsString } from 'class-validator';
import { CreateDispatchUseCase } from '../application/use-cases/create-dispatch.use-case';
import { JwtAuthGuard } from '@/modules/auth/infra/guard/jwt.guard';

class CreateDispatchDto {
  @IsString() incidentId!: string;
  @IsString() unitId!: string;
}

@UseGuards(JwtAuthGuard)
@Controller('dispatch')
export class DispatchController {
  constructor(private readonly createDispatch: CreateDispatchUseCase) {}

  @Post()
  assign(@Body() dto: CreateDispatchDto) {
    return this.createDispatch.execute(dto);
  }
}
