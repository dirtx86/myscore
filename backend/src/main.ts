import 'reflect-metadata';
import { join } from 'path';
import * as fs from 'fs';
import * as express from 'express';
import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Normalize double-slash paths (HAProxy stripping /api prefix can produce //route)
  app.use((req: any, _res: any, next: any) => {
    req.url = req.url.replace(/\/\/+/g, '/');
    next();
  });

  // Ensure upload dirs exist and serve static files
  fs.mkdirSync(join(process.cwd(), 'uploads', 'avatars'), { recursive: true });
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',').map(o => o.trim());
  app.enableCors({ origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins });

  const config = new DocumentBuilder()
    .setTitle('MySCORE WC2026 API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT || 3001);
  console.log(`Backend running on port ${process.env.PORT || 3001}`);
}
bootstrap();
