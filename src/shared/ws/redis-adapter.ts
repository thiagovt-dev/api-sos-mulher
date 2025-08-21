import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplication } from '@nestjs/common';
import { ServerOptions } from 'socket.io';

// Placeholder adapter – replace with Redis adapter if horizontal scaling is required
export class RedisIoAdapter extends IoAdapter {
  constructor(app: INestApplication) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const opts = {
      cors: { origin: '*', credentials: false },
      ...options,
    } as ServerOptions;
    return super.createIOServer(port, opts);
  }
}
