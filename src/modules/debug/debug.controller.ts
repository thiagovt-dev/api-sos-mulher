import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { FcmService } from '../../shared/notifications/fcm.service';
import { PrismaClient } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { Queue } from 'bullmq';
import { PUSH_QUEUE } from '@/infra/queue/tokens';
import { ApiBody, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Debug')
@Controller('debug')
export class DebugController {
  constructor(
    private readonly fcm: FcmService,
    private readonly prisma: PrismaClient,
    @Inject(PUSH_QUEUE) private readonly pushQueue: Queue,
  ) {}

  @Get('push/health')
  @ApiOperation({ summary: 'Status do serviço de push' })
  @ApiOkResponse({ schema: { example: { fcm: 'enabled' } } })
  health() {
    return { fcm: this.fcm.isEnabled() ? 'enabled' : 'disabled' };
  }

  @Post('push/token')
  @ApiOperation({ summary: 'Enviar push direto para um token' })
  @ApiBody({
    schema: {
      example: {
        token: 'fcm_token_abc123',
        title: 'Teste',
        body: 'Mensagem de teste',
        data: { type: 'DEBUG' },
      },
    },
  })
  @ApiOkResponse({ schema: { example: { ok: true } } })
  async pushDirect(
    @Body() body: { token: string; title?: string; body?: string; data?: Record<string, string> },
  ) {
    try {
      if (!body?.token || body.token.startsWith('SEU_')) {
        return { ok: false, reason: 'missing_or_placeholder_token' };
      }
      await this.fcm.safeSendToToken(
        body.token,
        body.data ?? {},
        body.title || body.body ? { title: body.title ?? '', body: body.body ?? '' } : undefined,
      );
      return { ok: true };
    } catch (e: any) {
      return { ok: false, reason: e?.code || 'push_send_failed', message: e?.message || String(e) };
    }
  }

  @Post('push/unit')
  @ApiOperation({ summary: 'Enviar push para uma unidade' })
  @ApiBody({
    schema: {
      example: {
        unitId: 'aaaa1111-bbbb-2222-cccc-3333dddd4444',
        title: 'Novo chamado',
        body: 'Atenda o incidente INC-1A2B3C',
        data: { type: 'INCIDENT_DISPATCH', incidentId: 'c1f20143-1f7d-4a8b-908f-3f0f6efb0f9a' },
      },
    },
  })
  @ApiQuery({
    name: 'queued',
    required: false,
    example: '1',
    description: 'Enviar via fila (1) ou direto',
  })
  @ApiOkResponse({ schema: { example: { ok: true, queued: true } } })
  async pushUnit(
    @Body() body: { unitId: string; title?: string; body?: string; data?: Record<string, string> },
    @Query('queued') queued?: string,
  ) {
    const unit = await this.prisma.unit.findUnique({ where: { id: body.unitId } });
    if (!unit?.fcmToken) return { ok: false, reason: 'unit_without_token' };

    const payload = {
      token: unit.fcmToken,
      data: body.data ?? { type: 'DEBUG_PUSH' },
      notification:
        body.title || body.body ? { title: body.title ?? '', body: body.body ?? '' } : undefined,
    };

    if (queued === '1') {
      await this.pushQueue.add('debug-push', payload);
      return { ok: true, queued: true };
    } else {
      await this.fcm.safeSendToToken(payload.token, payload.data, payload.notification);
      return { ok: true, queued: false };
    }
  }
}
