import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { AssetsModule } from './assets/assets.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
    imports: [
        AuthModule,
        AssetsModule,
        AnalyticsModule, // New Module
        PrismaModule,
        HealthModule,
        PrometheusModule.register(),
        TransactionsModule // Exposes /metrics endpoint
    ],
    controllers: [],
    providers: [],
})
/**
 * Root Application Module.
 * Imports all feature modules (Auth, Prisma, Health, Prometheus) to assemble the application.
 */
export class AppModule { }
