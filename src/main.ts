import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const swaggerCfg = new DocumentBuilder()
    .setTitle('Investco — Control de Obra')
    .setDescription('Backend ERP SI414. MODO DEMO: integraciones externas mockeadas.')
    .setVersion('0.1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .build();
  const doc = SwaggerModule.createDocument(app, swaggerCfg);
  SwaggerModule.setup('api/docs', app, doc);

  const useMocks = process.env.USE_MOCKS === 'true';
  if (useMocks) {
    Logger.warn('MODO DEMO activo — integraciones externas usan mocks', 'Bootstrap');
  }

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  Logger.log(`Investco backend on http://localhost:${port}/api`, 'Bootstrap');
  Logger.log(`Swagger docs on http://localhost:${port}/api/docs`, 'Bootstrap');
}

void bootstrap();
