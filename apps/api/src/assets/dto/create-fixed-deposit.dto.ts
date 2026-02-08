import { IsString, IsNotEmpty, IsNumber, IsDateString } from 'class-validator';

export class CreateFixedDepositDto {
    @IsString()
    @IsNotEmpty()
    name: string; // Bank Name / FD Name

    @IsNumber()
    principalAmount: number;

    @IsNumber()
    interestRate: number;

    @IsDateString()
    startDate: string;

    @IsDateString()
    maturityDate: string;
}
