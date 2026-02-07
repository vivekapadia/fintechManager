import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';

@Module({
    imports: [AuthModule, PrismaModule, HealthModule],
    controllers: [],
    providers: [],
})
/**
 * Root Application Module.
 * Imports all feature modules (Auth, Prisma, Health) to assemble the application.
 */
export class AppModule { }
