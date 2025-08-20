import * as fs from 'node:fs';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
let admin: typeof import('firebase-admin') | null = null;
try {
  admin = require('firebase-admin');
} catch {}

@Injectable()
export class FcmService implements OnModuleInit {
  private readonly logger = new Logger(FcmService.name);
  private enabled = false;

  onModuleInit() {
    if (!admin) {
      this.logger.warn('firebase-admin indisponível; modo simulado.');
      return;
    }
    try {
      if (admin.apps.length > 0) {
        this.enabled = true;
        return;
      }

      // 1) Preferir arquivo indicado no env
      const path = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
      if (path && fs.existsSync(path)) {
        const json = JSON.parse(fs.readFileSync(path, 'utf8'));
        admin.initializeApp({ credential: admin.credential.cert(json) });
        this.enabled = true;
        this.logger.log('FCM inicializado via FIREBASE_SERVICE_ACCOUNT_PATH');
        return;
      }

      // 2) Alternativa base64 (Opção B)
      const b64 = process.env.FCM_SA_BASE64;
      if (b64) {
        const json = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
        admin.initializeApp({ credential: admin.credential.cert(json) });
        this.enabled = true;
        this.logger.log('FCM inicializado via FCM_SA_BASE64');
        return;
      }

      // 3) Fallback: GOOGLE_APPLICATION_CREDENTIALS / ADC
      admin.initializeApp({ credential: admin.credential.applicationDefault() });
      this.enabled = true;
      this.logger.log('FCM via Application Default Credentials');
    } catch (err) {
      this.enabled = false;
      this.logger.warn('FCM indisponível: ' + (err as Error).message);
    }
  }

  isEnabled() {
    return this.enabled;
  }
  async safeSendToToken(
    token: string,
    data: Record<string, string>,
    notification?: { title: string; body: string },
  ) {
    if (!this.enabled || !admin) {
      this.logger.log(
        `[DEV] Push simulado: ${token} ${JSON.stringify(data)} ${JSON.stringify(notification)}`,
      );
      return;
    }
    await admin.messaging().send({ token, data, notification, android: { priority: 'high' } });
  }
}
