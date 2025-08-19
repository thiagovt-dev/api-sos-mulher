import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './infra/database/prisma.module';
import { HealthModule } from './health/health.module';
import { UsersModule } from './modules/users/presentation/users.module';
// import { AuthModule } from './modules/auth/presentation/auth.module';
import appConfig from './config/app.config';
import { BullmqModule } from './infra/queue/bullmq.module';

const isTest = process.env.NODE_ENV === 'test';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [appConfig] }),
    PrismaModule,
    ...(!isTest ? [BullmqModule] : []), 
    HealthModule,
    UsersModule,
    // AuthModule,
  ],
})
export class AppModule {}
