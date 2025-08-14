import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('main');
  const configService = app.get(ConfigService);

  app
    .useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    )
    .enableCors({
      origin: 'http://localhost:4200',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      allowedHeaders: 'Content-Type,Authorization',
      credentials: true,
    });

  const portFromEnv =
    configService.get<string>('PORT') ?? configService.get<string>('DEV_PORT');
  const port = Number.parseInt(portFromEnv ?? '3000', 10);

  const config = new DocumentBuilder()
    .setTitle('Myio API')
    .setDescription('API documentation for the Myio project')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const swaggerUrl = `http://localhost:${port}/api`;
  logger.log(`>>>>>>>>> Swagger UI available at: ${swaggerUrl}`);

  await app.listen(port, '0.0.0.0');
}
void bootstrap();
