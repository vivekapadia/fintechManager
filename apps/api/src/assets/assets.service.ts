import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { CreateMutualFundDto } from './dto/create-mutual-fund.dto';
import { CreateFixedDepositDto } from './dto/create-fixed-deposit.dto';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
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

    async createMutualFund(userId: string, createMutualFundDto: CreateMutualFundDto) {
        const { name, symbol, nav, units } = createMutualFundDto;

        return this.prisma.$transaction(async (prisma) => {
            // 1. Create the base Asset record
            const asset = await prisma.asset.create({
                data: {
                    userId,
                    name,
                    type: AssetType.MUTUAL_FUND,
                },
            });

            // 2. Create the InvestmentDetails
            await prisma.investmentDetails.create({
                data: {
                    assetId: asset.id,
                    symbol,
                    averageBuyPrice: nav, // NAV acts as Buy Price
                    quantity: units,
                },
            });

            // 3. Log the initial BUY transaction
            await prisma.transaction.create({
                data: {
                    userId,
                    assetId: asset.id,
                    type: TransactionType.BUY,
                    amount: nav * units,
                    pricePerUnit: nav,
                    quantity: units,
                    date: new Date(),
                    notes: 'Initial Mutual Fund Purchase',
                },
            });

            return asset;
        });
    }

    async createFixedDeposit(userId: string, createFixedDepositDto: CreateFixedDepositDto) {
        const { name, principalAmount, interestRate, startDate, maturityDate } = createFixedDepositDto;

        return this.prisma.$transaction(async (prisma) => {
            // 1. Create Base Asset
            const asset = await prisma.asset.create({
                data: {
                    userId,
                    name,
                    type: AssetType.FIXED_DEPOSIT,
                },
            });

            // 2. Create FD Details
            await prisma.fixedDepositDetails.create({
                data: {
                    assetId: asset.id,
                    principalAmount,
                    interestRate,
                    startDate: new Date(startDate),
                    maturityDate: new Date(maturityDate),
                    maturityAmount: principalAmount + (principalAmount * interestRate * 1) / 100, // Simplistic calc
                },
            });

            // 3. Log Transaction
            await prisma.transaction.create({
                data: {
                    userId,
                    assetId: asset.id,
                    type: TransactionType.DEPOSIT_FD,
                    amount: principalAmount,
                    date: new Date(startDate),
                    notes: 'Fixed Deposit Created',
                },
            });

            return asset;
        });
    }

    async createLoan(userId: string, createLoanDto: CreateLoanDto) {
        const { name, principalAmount, interestRate, tenureMonths, startDate } = createLoanDto;

        // EMI Calculation
        // P * r * (1 + r)^n / ((1 + r)^n - 1)
        const r = interestRate / (12 * 100); // Monthly rate
        const n = tenureMonths;

        let emi = 0;
        if (interestRate === 0) {
            emi = principalAmount / n;
        } else {
            emi = (principalAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        }

        return this.prisma.$transaction(async (prisma) => {
            // 1. Create Base Asset
            const asset = await prisma.asset.create({
                data: {
                    userId,
                    name,
                    type: AssetType.LOAN,
                },
            });

            // 2. Create Loan Details
            await prisma.loanDetails.create({
                data: {
                    assetId: asset.id,
                    principalAmount,
                    interestRate,
                    tenureMonths,
                    startDate: new Date(startDate),
                    status: 'APPROVED',
                    emiAmount: parseFloat(emi.toFixed(2)),
                },
            });

            // 3. Log Transaction
            await prisma.transaction.create({
                data: {
                    userId,
                    assetId: asset.id,
                    type: TransactionType.BUY, // Using BUY as placeholder for Disbursement
                    amount: principalAmount,
                    date: new Date(startDate),
                    notes: 'Loan Disbursed',
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
                fdDetails: true,
                loanDetails: true,
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async remove(id: string, userId: string) {
        // 1. Verify ownership
        const asset = await this.prisma.asset.findFirst({
            where: { id, userId },
        });

        if (!asset) {
            throw new Error('Asset not found or access denied');
        }

        return this.prisma.$transaction(async (prisma) => {
            // 2. Delete related Transactions first (Manual cleanup)
            await prisma.transaction.deleteMany({
                where: { assetId: id },
            });

            // 3. Delete Asset (Cascades to Details)
            return prisma.asset.delete({
                where: { id },
            });
        });
    }

    async update(id: string, userId: string, updateDto: UpdateAssetDto) {
        const asset = await this.prisma.asset.findFirst({
            where: { id, userId },
            include: {
                investmentDetails: true,
                fdDetails: true,
                loanDetails: true,
            }
        });

        if (!asset) {
            throw new Error('Asset not found');
        }

        return this.prisma.$transaction(async (prisma) => {
            // 1. Update Base Asset
            if (updateDto.name) {
                await prisma.asset.update({
                    where: { id },
                    data: { name: updateDto.name }
                });
            }

            // 2. Update Details based on Type
            if (asset.type === AssetType.STOCK || asset.type === AssetType.MUTUAL_FUND) {
                await prisma.investmentDetails.update({
                    where: { assetId: id },
                    data: {
                        symbol: updateDto.symbol,
                        quantity: updateDto.quantity,
                        averageBuyPrice: updateDto.buyPrice,
                    }
                });
            } else if (asset.type === AssetType.FIXED_DEPOSIT) {
                // Recalculate Maturity if needed
                let maturityAmount = undefined;
                if (updateDto.principalAmount || updateDto.interestRate) {
                    const p = updateDto.principalAmount || asset.fdDetails.principalAmount;
                    const r = updateDto.interestRate || asset.fdDetails.interestRate;
                    maturityAmount = p + (p * r * 1) / 100; // Keeping simple logic
                }

                await prisma.fixedDepositDetails.update({
                    where: { assetId: id },
                    data: {
                        principalAmount: updateDto.principalAmount,
                        interestRate: updateDto.interestRate,
                        startDate: updateDto.startDate ? new Date(updateDto.startDate) : undefined,
                        maturityDate: updateDto.maturityDate ? new Date(updateDto.maturityDate) : undefined,
                        maturityAmount,
                    }
                });
            } else if (asset.type === AssetType.LOAN) {
                // Recalculate EMI if needed
                let emiAmount = undefined;
                if (updateDto.principalAmount || updateDto.interestRate || updateDto.tenureMonths) {
                    const p = updateDto.principalAmount || asset.loanDetails.principalAmount;
                    const rate = updateDto.interestRate || asset.loanDetails.interestRate;
                    const n = updateDto.tenureMonths || asset.loanDetails.tenureMonths;

                    const r = rate / (12 * 100);
                    if (rate === 0) {
                        emiAmount = p / n;
                    } else {
                        emiAmount = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
                    }
                    emiAmount = parseFloat(emiAmount.toFixed(2));
                }

                await prisma.loanDetails.update({
                    where: { assetId: id },
                    data: {
                        principalAmount: updateDto.principalAmount,
                        interestRate: updateDto.interestRate,
                        startDate: updateDto.startDate ? new Date(updateDto.startDate) : undefined,
                        tenureMonths: updateDto.tenureMonths,
                        emiAmount,
                    }
                });
            }

            return prisma.asset.findUnique({ where: { id } });
        });
    }
}
