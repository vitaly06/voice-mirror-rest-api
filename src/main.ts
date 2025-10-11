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

  // Настройка статических файлов для uploads
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Настройка Swagger
  const config = new DocumentBuilder()
    .setTitle('🎤 VoiceMirror API')
    .setDescription(
      `
      ## 🎯 API для PWA приложения VoiceMirror
      
      VoiceMirror - это инновационное приложение для клонирования голоса с использованием технологий искусственного интеллекта.
      
      ### 🚀 Основной функционал:
      
      **📤 Запись и загрузка голоса:**
      - Загрузка аудиофайлов (WAV, MP3, M4A)
      - Автоматическое клонирование голоса через ElevenLabs API
      - Отслеживание статуса обработки
      
      **🗣️ Синтез речи:**
      - Генерация речи с клонированным голосом
      - Предзаписанные ответы для чат-интерфейса
      - Кастомная генерация текста в речь
      
      **💬 Чат-интерфейс:**
      - Готовые вопросы и ответы
      - Воспроизведение с клонированным голосом
      - Интерактивное общение
      
      ### 🔧 Технологии:
      - **Backend:** NestJS + TypeScript
      - **База данных:** PostgreSQL + Prisma
      - **ИИ:** ElevenLabs API для клонирования голоса
      - **Frontend:** PWA (Progressive Web App)
      
      ### 📝 Примечания:
      - Максимальный размер аудиофайла: 10MB
      - Рекомендуемая длительность записи: до 1 минуты
      - Поддерживаемые форматы: WAV, MP3, M4A
    `,
    )
    .setVersion('1.0.0')
    .setContact(
      'VoiceMirror Team',
      'https://github.com/vitaly06/voice-mirror-rest-api',
      'support@voicemirror.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addTag(
      '🎤 Аудио и Голосовые технологии',
      'Основные методы для работы с аудио и клонированием голоса',
    )
    .addServer('http://localhost:3000', 'Локальный сервер разработки')
    .addServer('https://api.voicemirror.com', 'Продакшн сервер')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
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
📚 API документация: http://localhost:${port}/api
🎤 VoiceMirror готов к использованию!
  `);
}

bootstrap();
