import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './infra/database/prisma.module';
import { HealthModule } from './health/health.module';
import { UsersModule } from './modules/users/presentation/users.module';
import { IncidentsModule } from './modules/incidents/presentation/incidents.module';
import { DispatchModule } from './modules/dispatch/presentation/dispatch.module';
import { AuthModule } from './modules/auth/presentation/auth.module';
import appConfig from './config/app.config';
import { BullmqModule } from './infra/queue';
import { UnitsModule } from './modules/units/presentation/units.module';
import { DebugModule } from './modules/debug/debug.module';
import { VoiceModule } from './modules/voice/presentation/voice.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './shared/auth/roles.guard';

const isTest = process.env.NODE_ENV === 'test';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [appConfig] }),
    PrismaModule,
    ...(!isTest ? [BullmqModule] : []),
    AuthModule,
    HealthModule,
    UsersModule,
    IncidentsModule,
    DispatchModule,
    UnitsModule,
    VoiceModule,
    DebugModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: RolesGuard }],
})
export class AppModule {}
