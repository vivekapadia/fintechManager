import { IsString, IsNotEmpty, IsNumber, IsDateString } from 'class-validator';

export class CreateLoanDto {
    @IsString()
    @IsNotEmpty()
    name: string; // Loan Name (e.g. Home Loan)

    @IsNumber()
    principalAmount: number;

    @IsNumber()
    interestRate: number; // Annual Interest Rate %

    @IsNumber()
    tenureMonths: number;

    @IsDateString()
    startDate: string;
}
