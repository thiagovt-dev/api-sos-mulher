import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CONNECTION',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return new IORedis({
          host: config.get<string>('redis.host'),
          port: config.get<number>('redis.port'),
        });
      },
    },
    {
      provide: 'DEFAULT_QUEUE',
      inject: ['REDIS_CONNECTION'],
      useFactory: (conn: IORedis) => new Queue('default', { connection: conn }),
    },
  ],
  exports: ['REDIS_CONNECTION', 'DEFAULT_QUEUE'],
})
export class BullmqModule {}
