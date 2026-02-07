import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';

/**
 * Service responsible for handling user authentication logic.
 * Includes password hashing, validation, and JWT token generation.
 */
@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async register(dto: RegisterDto) {
        // Check if user exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (existingUser) {
            throw new ConflictException('User already exists');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(dto.password, 10);

        // Create user
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash,
            },
        });

        return this.signToken(user.id, user.email);
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (!user) throw new UnauthorizedException('Invalid credentials');

        // Social login users might not have a password hash
        if (!user.passwordHash) throw new UnauthorizedException('Please login with social provider');

        const isMatch = await bcrypt.compare(dto.password, user.passwordHash!);
        if (!isMatch) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return this.signToken(user.id, user.email);
    }

    private async signToken(userId: string, email: string) {
        const payload = { sub: userId, email };
        const token = await this.jwtService.signAsync(payload, {
            expiresIn: '1d',
            secret: 'super-secret-key', // In prod, use env vars!
        });

        return {
            access_token: token,
        };
    }
}
