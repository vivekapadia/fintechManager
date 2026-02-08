import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateMutualFundDto {
    @IsString()
    @IsNotEmpty()
    name: string; // Scheme Name

    @IsString()
    @IsNotEmpty()
    symbol: string; // AMFI Code or Ticker

    @IsNumber()
    units: number;

    @IsNumber()
    nav: number; // Net Asset Value (Price per unit)
}
