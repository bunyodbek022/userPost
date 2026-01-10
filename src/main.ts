import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import  cookieParser from 'cookie-parser';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

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
  app.use(cookieParser());
  app.enableCors({
  origin: 'http://localhost:3001', 
  credentials: true,               
});
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
