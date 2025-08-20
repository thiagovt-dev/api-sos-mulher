import { Injectable, OnModuleInit } from '@nestjs/common';
import IORedis from 'ioredis';
import Redlock from 'redlock';

@Injectable()
export class RedlockService implements OnModuleInit {
  private client!: IORedis;
  private redlock!: Redlock;

  onModuleInit() {
    this.client = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379');
    this.redlock = new Redlock([this.client], { retryCount: 0 });
  }

  async withLock<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
    const lock = await this.redlock.acquire([`lock:${key}`], ttlMs);
    try {
      return await fn();
    } finally {
      await lock.release().catch(() => void 0);
    }
  }
}
