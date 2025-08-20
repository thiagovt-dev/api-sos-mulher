import { Body, Controller, Post } from '@nestjs/common';
import { IsString } from 'class-validator';
import { CreateDispatchUseCase } from '../application/use-cases/create-dispatch.use-case';

class CreateDispatchDto {
  @IsString() incidentId!: string;
  @IsString() unitId!: string;
}

@Controller('dispatch')
export class DispatchController {
  constructor(private readonly createDispatch: CreateDispatchUseCase) {}

  @Post()
  assign(@Body() dto: CreateDispatchDto) {
    return this.createDispatch.execute(dto);
  }
}
