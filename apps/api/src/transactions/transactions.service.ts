import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionsService {
    constructor(private prisma: PrismaService) { }

    async findAll(userId: string) {
        return this.prisma.transaction.findMany({
            where: { userId },
            include: {
                asset: {
                    select: {
                        name: true,
                        type: true,
                    }
                }
            },
            orderBy: { date: 'desc' },
        });
    }
}
