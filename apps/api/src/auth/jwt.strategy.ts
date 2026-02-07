import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private prisma: PrismaService) {
        super({
            // Extract the JWT from the Authorization header (Bearer <token>)
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            // Reject expired tokens
            ignoreExpiration: false,
            // Secret key to verify the token signature (MUST match AuthModule)
            secretOrKey: 'super-secret-key', // Use env var in prod
        });
    }

    async validate(payload: { sub: string; email: string }) {
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
        });
        return user;
    }
}
