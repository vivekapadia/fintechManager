import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { AssetsService } from '../assets/assets.service';

@Injectable()
export class AnalyticsService {
    constructor(private assetsService: AssetsService) { }

    async getPortfolioAnalytics(userId: string) {
        console.log(`[Analytics] Request for User: ${userId}`);

        // 1. Fetch User Assets
        const assets: any[] = await this.assetsService.findAll(userId);
        console.log(`[Analytics] Found ${assets?.length || 0} assets for user`);

        if (!assets || assets.length === 0) {
            console.log('[Analytics] No assets found, returning empty.');
            return {
                net_worth: 0,
                gross_assets: 0,
                liabilities: 0,
                allocation: {},
                message: "No assets found"
            };
        }

        // 2. Transform Data for Python Engine
        const payload = assets.map(asset => {
            let value = 0;
            let quantity = 0;
            let buyPrice = 0;
            let symbol = null;

            if (asset.type === 'STOCK' || asset.type === 'MUTUAL_FUND') {
                value = asset.investmentDetails?.averageBuyPrice || 0;
                quantity = asset.investmentDetails?.quantity || 0;
                buyPrice = asset.investmentDetails?.averageBuyPrice || 0;
                symbol = asset.investmentDetails?.symbol;
            } else if (asset.type === 'FIXED_DEPOSIT') {
                value = asset.fdDetails?.principalAmount || 0;
            } else if (asset.type === 'LOAN') {
                value = asset.loanDetails?.principalAmount || 0;
            }

            return {
                type: asset.type,
                name: asset.name,
                symbol,
                quantity,
                value,     // Principal / Buy Price
                buyPrice   // Redundant but specific
            };
        });

        console.log('[Analytics] Sending Payload to Engine:', JSON.stringify(payload));

        // 3. Call Python Engine
        try {
            const engineUrl = process.env.ENGINE_URL || 'http://127.0.0.1:8000';
            console.log(`[Analytics] Connecting to Engine at: ${engineUrl}/calculate/portfolio`);

            // Using native fetch (Node 18+)
            const response = await fetch(`${engineUrl}/calculate/portfolio`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assets: payload })
            });

            if (!response.ok) {
                throw new Error(`Engine Error: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('[Analytics] Engine Response:', JSON.stringify(data));
            return data;

        } catch (error) {
            console.error('[Analytics] Engine Connection Failed:', error.cause || error.message);
            // Return a fallback so the dashboard doesn't crash completely
            return {
                net_worth: 0,
                gross_assets: 0,
                liabilities: 0,
                allocation: {},
                message: "Analytics Engine Unavailable (Check Python Service)"
            };
        }
    }
}
