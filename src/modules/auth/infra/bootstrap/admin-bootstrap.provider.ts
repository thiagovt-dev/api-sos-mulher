import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminBootstrapProvider implements OnModuleInit {
  private readonly log = new Logger(AdminBootstrapProvider.name);
  constructor(private readonly prisma: PrismaClient) {}

  async onModuleInit() {
    const count = await this.prisma.user.count({ where: { roles: { has: 'ADMIN' } } });
    if (count > 0) return;

    const email = process.env.ADMIN_BOOTSTRAP_EMAIL;
    const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
    if (!email || !password) {
      this.log.warn('No ADMIN exists and no ADMIN_BOOTSTRAP_* provided. Skipping bootstrap.');
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await this.prisma.user.create({
      data: { email, passwordHash, roles: { set: ['ADMIN'] } },
    });

    this.log.log(`Bootstrap ADMIN created (${email}). Change the password ASAP.`);
  }
}
