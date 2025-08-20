import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { FcmService } from '../../shared/notifications/fcm.service';
import { PrismaClient } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { Queue } from 'bullmq';
import { PUSH_QUEUE } from '@/infra/queue/tokens';

@Controller('debug')
export class DebugController {
  constructor(
    private readonly fcm: FcmService,
    private readonly prisma: PrismaClient,
    @Inject(PUSH_QUEUE) private readonly pushQueue: Queue,
  ) {}

  @Get('push/health')
  health() {
    return { fcm: this.fcm.isEnabled() ? 'enabled' : 'disabled' };
  }

  @Post('push/token')
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
