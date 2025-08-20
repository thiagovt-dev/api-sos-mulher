import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

let admin: typeof import('firebase-admin') | null = null;
try {
  admin = require('firebase-admin');
} catch {
  console.log("ERROR: firebase-admin não instalado");
}

@Injectable()
export class FcmService implements OnModuleInit {
  private readonly logger = new Logger(FcmService.name);
  private enabled = false;

  onModuleInit() {
    try {
      if (admin && admin.apps.length === 0) {
        admin.initializeApp({ credential: admin.credential.applicationDefault() });
      }
      this.enabled = !!admin;
      if (!this.enabled)
        this.logger.warn('FCM desabilitado (firebase-admin não disponível ou sem credenciais).');
    } catch (err) {
      this.enabled = false;
      this.logger.warn('FCM indisponível: ' + (err as Error).message);
    }
  }

  async safeSendToToken(
    token: string,
    data: Record<string, string>,
    notification?: { title: string; body: string },
  ) {
    if (!this.enabled || !admin) {
      this.logger.log(
        `[DEV] Push simulado para ${token} - data=${JSON.stringify(data)} notif=${JSON.stringify(notification)}`,
      );
      return;
    }
    try {
      await admin.messaging().send({ token, data, notification, android: { priority: 'high' } });
    } catch (err) {
      this.logger.warn(`FCM error: ${(err as Error).message}`);
    }
  }
}
