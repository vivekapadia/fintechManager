import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { CreateMutualFundDto } from './dto/create-mutual-fund.dto';
import { CreateFixedDepositDto } from './dto/create-fixed-deposit.dto';
import { CreateLoanDto } from './dto/create-loan.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('assets')
@UseGuards(JwtAuthGuard)
export class AssetsController {
    constructor(private readonly assetsService: AssetsService) { }

    @Post('stock')
    createStock(@Request() req, @Body() createStockDto: CreateStockDto) {
        return this.assetsService.createStock(req.user.id, createStockDto);
    }

    @Post('mutual-fund')
    createMutualFund(@Request() req, @Body() createMutualFundDto: CreateMutualFundDto) {
        return this.assetsService.createMutualFund(req.user.id, createMutualFundDto);
    }

    @Post('fixed-deposit')
    createFixedDeposit(@Request() req, @Body() createFixedDepositDto: CreateFixedDepositDto) {
        return this.assetsService.createFixedDeposit(req.user.id, createFixedDepositDto);
    }

    @Post('loan')
    createLoan(@Request() req, @Body() createLoanDto: CreateLoanDto) {
        return this.assetsService.createLoan(req.user.id, createLoanDto);
    }

    @Get()
    findAll(@Request() req) {
        return this.assetsService.findAll(req.user.id);
    }
}
