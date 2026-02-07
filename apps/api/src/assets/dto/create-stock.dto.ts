import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateStockDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    symbol: string; // e.g., AAPL

    @IsNumber()
    quantity: number;

    @IsNumber()
    buyPrice: number;
}
