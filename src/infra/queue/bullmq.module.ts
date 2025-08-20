import { Global, Module, OnModuleDestroy } from '@nestjs/common';
import IORedis from 'ioredis';
import { Queue, Worker, JobsOptions } from 'bullmq';
import { PUSH_QUEUE } from './tokens';
import { FcmService } from '../../shared/notifications/fcm.service';

@Global()
@Module({
  imports: [],
  providers: [
    FcmService,
    {
      provide: PUSH_QUEUE,
      useFactory: () => {
        const connection = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
          maxRetriesPerRequest: null,
        });
        return new Queue('push', {
          connection,
          defaultJobOptions: { removeOnComplete: 50, removeOnFail: 100 } as JobsOptions,
        });
      },
    },
    {
      provide: 'PUSH_WORKER',
      inject: [FcmService],
      useFactory: (fcm: FcmService) => {
        const connection = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
          maxRetriesPerRequest: null,
        });
        const worker = new Worker(
          'push',
          async (job) => {
            const { token, data, notification } = job.data as {
              token: string;
              data: Record<string, string>;
              notification?: { title: string; body: string };
            };
            await fcm.safeSendToToken(token, data, notification);
          },
          { connection },
        );
        return worker;
      },
    },
  ],
  exports: [PUSH_QUEUE],
})
export class BullmqModule implements OnModuleDestroy {
  async onModuleDestroy() {
    /* noop */
  }
}