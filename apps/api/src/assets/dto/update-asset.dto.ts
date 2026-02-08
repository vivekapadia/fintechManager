export class UpdateAssetDto {
    name?: string;

    // Stock / Mutual Fund
    symbol?: string;
    quantity?: number;
    buyPrice?: number; // Maps to averageBuyPrice or NAV

    // FD / Loan
    principalAmount?: number;
    interestRate?: number;
    startDate?: string;

    // FD
    maturityDate?: string;

    // Loan
    tenureMonths?: number;
}
