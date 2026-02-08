import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { AssetsModule } from '../assets/assets.module';

@Module({
    imports: [AssetsModule],
    controllers: [AnalyticsController],
    providers: [AnalyticsService],
})
export class AnalyticsModule { }
