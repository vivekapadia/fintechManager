import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Application Entry Point.
 * Bootstraps the NestJS application, enables CORS for frontend communication,
 * and starts the server on port 3000.
 */
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    // Enable Cross-Origin Resource Sharing (CORS) to allow requests from the React frontend (port 5173)
    // Enable Cross-Origin Resource Sharing (CORS)
    app.enableCors({
        origin: true, // Allow all origins (reflects the request origin)
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    await app.listen(3000, '0.0.0.0');
    console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
