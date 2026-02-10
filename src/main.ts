import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(cookieParser());
  const uploadsPath = join(process.cwd(), 'uploads');
  app.use('/uploads', express.static('uploads'));

  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads/',
  });


  app.setGlobalPrefix('api');

  const allowedOrigins =
    process.env.NODE_ENV === 'production'
      ? (process.env.CORS_ORIGINS?.split(',') || ['https://bunyodbek.me'])
      : ['http://localhost:3001', 'http://localhost:3000'];

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // 3. Global Pipelar
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // 4. Swagger sozlamalari
  const config = new DocumentBuilder()
    .setTitle('NestJS MongoDB Project')
    .setDescription('User va Post CRUD operatsiyalari uchun API dokumentatsiya')
    .setVersion('1.0')
    .addTag('users')
    .addTag('posts')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'accessToken',
        in: 'cookie',
      },
      'cookie-auth-key',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
