import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('assets')
@UseGuards(JwtAuthGuard)
export class AssetsController {
    constructor(private readonly assetsService: AssetsService) { }

    @Post('stock')
    createStock(@Request() req, @Body() createStockDto: CreateStockDto) {
        return this.assetsService.createStock(req.user.id, createStockDto);
    }

    @Get()
    findAll(@Request() req) {
        return this.assetsService.findAll(req.user.id);
    }
}
