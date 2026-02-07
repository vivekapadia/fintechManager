import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    /**
     * Authenticates a user and returns a JWT access token.
     * @param dto Login credentials (email, password)
     */
    login(@Body() dto: LoginDto) {
        console.log('Login attempt:', dto.email);
        return this.authService.login(dto);
    }

    @Post('register')
    /**
     * Registers a new user and returns a JWT access token.
     * @param dto Registration details (email, password)
     */
    register(@Body() dto: RegisterDto) {
        console.log('Register attempt:', dto);
        return this.authService.register(dto);
    }
}
