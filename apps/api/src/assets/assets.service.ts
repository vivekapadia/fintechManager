import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { CreateMutualFundDto } from './dto/create-mutual-fund.dto';
import { CreateFixedDepositDto } from './dto/create-fixed-deposit.dto';
import { CreateLoanDto } from './dto/create-loan.dto';
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
        });
    }
}
