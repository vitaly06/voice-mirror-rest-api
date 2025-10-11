import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Настройка CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Глобальная валидация
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  const config = new DocumentBuilder()
    .setTitle('🎤 VoiceMirror API')
    .setVersion('1.0.0')
    .setContact(
      'Vitaly Sadikov',
      'https://github.com/vitaly06/voice-mirror-rest-api',
      'vitaly.sadikov1@yandex.ru',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3000', 'Локальный сервер разработки')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: '🎤 VoiceMirror API Документация',
    customfavIcon: 'https://cdn-icons-png.flaticon.com/512/1082/1082810.png',
    customCss: `
      .topbar { display: none; }
      .swagger-ui .info .title { color: #1976d2; font-size: 2.5rem; }
      .swagger-ui .info .description { font-size: 1.1rem; line-height: 1.6; }
      .swagger-ui .scheme-container { background: #fafafa; border-radius: 8px; padding: 15px; }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      docExpansion: 'list',
      defaultModelsExpandDepth: 3,
      defaultModelExpandDepth: 3,
    },
  });

  const port = process.env.PORT ?? 3000;

  await app.listen(port);

  console.log(`
🚀 Сервер запущен на http://localhost:${port}
📚 API документация: http://localhost:${port}/docs
🎤 VoiceMirror готов к использованию!
  `);
}

bootstrap();
