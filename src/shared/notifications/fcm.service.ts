import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FcmService implements OnModuleInit {
  private readonly logger = new Logger(FcmService.name);

  onModuleInit() {
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    }
  }

  async sendToToken(
    token: string,
    data: Record<string, string>,
    notification?: { title: string; body: string },
  ) {
    try {
      await admin.messaging().send({ token, data, notification, android: { priority: 'high' } });
    } catch (err) {
      this.logger.warn(`FCM error: ${(err as Error).message}`);
    }
  }
}
