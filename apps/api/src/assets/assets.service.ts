import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { AssetType, TransactionType } from '@prisma/client';

@Injectable()
export class AssetsService {
    constructor(private prisma: PrismaService) { }

    async createStock(userId: string, createStockDto: CreateStockDto) {
        const { name, symbol, buyPrice, quantity } = createStockDto;

        // Use a transaction to ensure Asset, InvestmentDetails, and Transaction are created together
        return this.prisma.$transaction(async (prisma) => {
            // 1. Create the base Asset record
            const asset = await prisma.asset.create({
                data: {
                    userId,
                    name,
                    type: AssetType.STOCK,
                },
            });

            // 2. Create the InvestmentDetails (Specific to Stocks/MFs)
            await prisma.investmentDetails.create({
                data: {
                    assetId: asset.id,
                    symbol,
                    averageBuyPrice: buyPrice,
                    quantity,
                },
            });

            // 3. Log the initial BUY transaction
            await prisma.transaction.create({
                data: {
                    userId,
                    assetId: asset.id,
                    type: TransactionType.BUY,
                    amount: buyPrice * quantity,
                    pricePerUnit: buyPrice,
                    quantity,
                    date: new Date(),
                    notes: 'Initial Stock Purchase',
                },
            });

            return asset;
        });
    }

    async findAll(userId: string) {
        return this.prisma.asset.findMany({
            where: { userId },
            include: {
                investmentDetails: true,
            },
        });
    }
}
