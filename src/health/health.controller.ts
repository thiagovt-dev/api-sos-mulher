import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Verificar saúde da aplicação' })
  @ApiOkResponse({ description: 'Aplicação saudável', schema: { example: { status: 'ok' } } })
  ok() {
    return { status: 'ok' };
  }
}
