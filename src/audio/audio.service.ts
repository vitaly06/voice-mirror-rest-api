import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import FormData = require('form-data');
import fetch from 'node-fetch';

@Injectable()
export class AudioService {
  private readonly logger = new Logger(AudioService.name);
  private baseUrl: string;
  private elevenLabsApiKey: string;
  private elevenLabsBaseUrl = 'https://api.elevenlabs.io/v1';

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>(
      'BASE_URL',
      'http://localhost:3000',
    );
    this.elevenLabsApiKey =
      this.configService.get<string>('ELEVENLABS_API_KEY') || '';

    if (!this.elevenLabsApiKey) {
      this.logger.warn(
        'ElevenLabs API key not configured. Voice cloning will not work.',
      );
    }
  }

  /**
   * Загружает аудиофайл и запускает клонирование голоса
   */
  async uploadAudio(file: Express.Multer.File) {
    try {
      this.logger.log(`Uploading audio file: ${file.filename}`);

      // Сохраняем запись в БД
      const audioUrl = `${this.baseUrl}/uploads/${file.filename}`;
      const audioRecord = await this.prisma.audio.create({
        data: {
          originalUrl: audioUrl,
          status: 'processing',
        },
      });

      // Запускаем клонирование голоса в фоне (только если есть API ключ)
      if (this.elevenLabsApiKey) {
        this.cloneVoice(file, audioRecord.id).catch((error) => {
          this.logger.error(
            `Voice cloning failed for audio ${audioRecord.id}:`,
            error,
          );
        });
      } else {
        // Если нет API ключа, создаем моковые ответы
        this.createMockResponses(audioRecord.id).catch((error) => {
          this.logger.error(`Failed to create mock responses:`, error);
        });
      }

      return {
        id: audioRecord.id,
        originalUrl: audioUrl,
        status: 'processing',
        message: 'Аудио загружено, клонирование голоса в процессе',
      };
    } catch (error) {
      this.logger.error('Failed to upload audio:', error);
      throw new HttpException(
        'Не удалось загрузить аудио',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Клонирует голос через ElevenLabs API
   */
  private async cloneVoice(file: Express.Multer.File, audioId: number) {
    try {
      this.logger.log(`Starting voice cloning for audio ${audioId}`);

      // Проверяем и очищаем старые голоса при необходимости
      await this.manageVoiceLimit();

      // Создаем голос в ElevenLabs
      const voiceId = await this.createElevenLabsVoice(file);
      this.logger.log(`Voice created with ID: ${voiceId}`);

      // Обновляем запись в БД
      await this.prisma.audio.update({
        where: { id: audioId },
        data: {
          voiceId,
          status: 'completed',
        },
      });

      // Создаем предзаписанные ответы
      await this.createPredefinedResponses(voiceId);
      this.logger.log(`Voice cloning completed for audio ${audioId}`);
    } catch (error) {
      this.logger.error('Voice cloning failed:', error);
      await this.prisma.audio.update({
        where: { id: audioId },
        data: { status: 'error' },
      });
    }
  }

  /**
   * Управляет лимитом голосов в ElevenLabs
   */
  private async manageVoiceLimit() {
    try {
      // Получаем список всех голосов
      const allVoices = await this.getElevenLabsVoices();
      this.logger.log(`Found ${allVoices.length} total voices in ElevenLabs`);

      // Фильтруем только пользовательские голоса (созданные нами)
      const customVoices = allVoices.filter(
        (voice) =>
          voice.category === 'cloned' ||
          voice.category === 'generated' ||
          (voice.name && voice.name.includes('voicemirror')),
      );

      this.logger.log(`Found ${customVoices.length} custom voices`);

      // Если пользовательских голосов много, удаляем старые
      if (customVoices.length >= 5) {
        const voicesToDelete = customVoices.slice(0, customVoices.length - 3); // Оставляем только 3 самых новых

        for (const voice of voicesToDelete) {
          try {
            await this.deleteElevenLabsVoice(voice.voice_id);
            this.logger.log(
              `Deleted custom voice: ${voice.name} (${voice.voice_id})`,
            );
          } catch (deleteError) {
            this.logger.warn(
              `Failed to delete voice ${voice.voice_id}: ${deleteError.message}`,
            );
            // Не прерываем процесс, пытаемся удалить следующий
          }
        }
      }
    } catch (error) {
      this.logger.warn('Failed to manage voice limit:', error.message);
    }
  }

  /**
   * Получает список голосов из ElevenLabs
   */
  private async getElevenLabsVoices(): Promise<any[]> {
    const response = await fetch(`${this.elevenLabsBaseUrl}/voices`, {
      headers: {
        'xi-api-key': this.elevenLabsApiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(
        `Failed to get voices: ${response.status} ${errorText}`,
      );
      throw new Error(`Failed to get voices: ${response.status}`);
    }

    const result = await response.json();
    const voices = result.voices || [];

    // Логируем информацию о голосах для отладки
    voices.forEach((voice) => {
      this.logger.debug(
        `Voice: ${voice.name} | ID: ${voice.voice_id} | Category: ${voice.category} | Sharing: ${voice.sharing}`,
      );
    });

    return voices;
  }

  /**
   * Удаляет голос из ElevenLabs
   */
  private async deleteElevenLabsVoice(voiceId: string): Promise<void> {
    const response = await fetch(
      `${this.elevenLabsBaseUrl}/voices/${voiceId}`,
      {
        method: 'DELETE',
        headers: {
          'xi-api-key': this.elevenLabsApiKey,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to delete voice ${voiceId}: ${response.status}`);
    }
  }

  /**
   * Создает голос в ElevenLabs
   */
  private async createElevenLabsVoice(
    file: Express.Multer.File,
  ): Promise<string> {
    const formData = new FormData();
    formData.append('name', `voice_${Date.now()}`);
    formData.append('files', fs.createReadStream(file.path), {
      filename: file.originalname,
      contentType: file.mimetype,
    });
    formData.append('description', 'Voice clone for VoiceMirror');

    const response = await fetch(`${this.elevenLabsBaseUrl}/voices/add`, {
      method: 'POST',
      headers: {
        'xi-api-key': this.elevenLabsApiKey,
      },
      body: formData as any,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    return result.voice_id;
  }

  /**
   * Создает предзаписанные ответы с клонированным голосом
   */
  private async createPredefinedResponses(voiceId: string) {
    const questionsAndAnswers = [
      {
        question: 'Как дела?',
        answer:
          'Да всё прекрасно, спасибо большое что спросил! А у тебя как успехи? Готов пообщаться и поделиться мыслями.',
      },
      {
        question: 'Расскажи историю',
        answer:
          'Знаешь, недавно я узнал одну удивительную историю про то, как искусственный интеллект научился копировать человеческие голоса... Представляешь, теперь можно услышать свой собственный голос, говорящий совершенно разные вещи! Это же фантастика какая-то.',
      },
      {
        question: 'Что делаешь?',
        answer:
          'Да вот, общаюсь с тобой сейчас, и мне это действительно нравится! Всегда интересно узнать что-то новое от людей. А ты чем занимаешься? Может, расскажешь о своих планах?',
      },
      {
        question: 'Как настроение?',
        answer:
          'О, настроение просто отличное! Солнечное такое, позитивное настроение. А знаешь что? Мне кажется, хорошее настроение - это половина успеха в любом деле. Как твоё настроение, кстати?',
      },
      {
        question: 'Расскажи анекдот',
        answer:
          'Ну слушай, вот тебе свежий анекдотик! Приходит программист к врачу и говорит: "Доктор, у меня болит голова!" Врач отвечает: "Попробуйте перезагрузиться." Программист: "Уже пробовал, не помогает." Врач: "Тогда переустановите операционную систему!" Ха-ха, смешно же!',
      },
    ];

    for (const { question, answer } of questionsAndAnswers) {
      try {
        // Генерируем аудио для ответа через ElevenLabs
        const audioBuffer = await this.generateSpeech(answer, voiceId);
        const fileName = `response_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.mp3`;
        const filePath = path.join('./uploads', fileName);

        fs.writeFileSync(filePath, audioBuffer);

        await this.prisma.chatResponse.create({
          data: {
            question,
            audioUrl: `${this.baseUrl}/uploads/${fileName}`,
            voiceId,
          },
        });

        this.logger.log(`Created response for question: "${question}"`);
      } catch (error) {
        this.logger.error(
          `Failed to create response for: "${question}"`,
          error,
        );
      }
    }
  }

  /**
   * Создает моковые ответы без клонирования голоса (для тестирования)
   */
  private async createMockResponses(audioId: number) {
    const questionsAndAnswers = [
      { question: 'Как дела?', audioFile: 'mock-response-1.mp3' },
      { question: 'Расскажи историю', audioFile: 'mock-response-2.mp3' },
      { question: 'Что делаешь?', audioFile: 'mock-response-3.mp3' },
      { question: 'Как настроение?', audioFile: 'mock-response-4.mp3' },
      { question: 'Расскажи анекдот', audioFile: 'mock-response-5.mp3' },
    ];

    // Обновляем статус на completed
    await this.prisma.audio.update({
      where: { id: audioId },
      data: { status: 'completed' },
    });

    for (const { question, audioFile } of questionsAndAnswers) {
      await this.prisma.chatResponse.create({
        data: {
          question,
          audioUrl: `${this.baseUrl}/uploads/${audioFile}`,
          voiceId: `mock_voice_${audioId}`,
        },
      });
    }

    this.logger.log(`Created mock responses for audio ${audioId}`);
  }

  /**
   * Генерирует речь через ElevenLabs TTS
   */
  private async generateSpeech(text: string, voiceId: string): Promise<Buffer> {
    // Предобработка текста для лучшего произношения на русском
    const processedText = this.preprocessRussianText(text);
    const response = await fetch(
      `${this.elevenLabsBaseUrl}/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': this.elevenLabsApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: processedText,
          model_id: 'eleven_multilingual_v2', // Многоязычная модель для русского языка
          voice_settings: {
            stability: 0.65, // Увеличиваем стабильность для более естественной речи
            similarity_boost: 0.85, // Увеличиваем схожесть с оригинальным голосом
            style: 0.3, // Добавляем немного стиля для выразительности
            use_speaker_boost: true, // Улучшает качество для клонированных голосов
          },
          pronunciation_dictionary_locators: [], // Для корректного произношения
          language_code: 'ru', // Явно указываем русский язык
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs TTS error: ${response.status} ${errorText}`);
    }

    return Buffer.from(await response.arrayBuffer());
  }

  /**
   * Получает статус обработки аудио
   */
  async getAudioStatus(id: number) {
    const audio = await this.prisma.audio.findUnique({
      where: { id },
    });

    if (!audio) {
      throw new HttpException('Аудиозапись не найдена', HttpStatus.NOT_FOUND);
    }

    return {
      ...audio,
      clonedUrl: audio.clonedUrl || undefined,
      voiceId: audio.voiceId || undefined,
    };
  }

  /**
   * Получает готовые ответы для чата
   */
  async getChatResponses(voiceId?: string) {
    const where = voiceId ? { voiceId } : {};

    return await this.prisma.chatResponse.findMany({
      where,
      select: {
        id: true,
        question: true,
        audioUrl: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Генерирует кастомный ответ с клонированным голосом
   */
  async generateCustomResponse(text: string, voiceId: string) {
    try {
      // Проверяем, существует ли голос
      const audioWithVoice = await this.prisma.audio.findFirst({
        where: { voiceId },
      });

      if (!audioWithVoice && !voiceId.startsWith('mock_voice_')) {
        throw new HttpException('Голос не найден', HttpStatus.NOT_FOUND);
      }

      if (!this.elevenLabsApiKey) {
        // Возвращаем моковый ответ для тестирования
        return {
          audioUrl: `${this.baseUrl}/uploads/mock-custom-response.mp3`,
          text,
        };
      }

      const audioBuffer = await this.generateSpeech(text, voiceId);
      const fileName = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.mp3`;
      const filePath = path.join('./uploads', fileName);

      fs.writeFileSync(filePath, audioBuffer);

      this.logger.log(`Generated custom speech for text: "${text}"`);

      return {
        audioUrl: `${this.baseUrl}/uploads/${fileName}`,
        text,
      };
    } catch (error) {
      this.logger.error('Failed to generate custom response:', error);
      throw new HttpException(
        'Не удалось синтезировать речь',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Предобрабатывает русский текст для лучшего произношения
   */
  private preprocessRussianText(text: string): string {
    return (
      text
        // Добавляем паузы после знаков препинания для более естественной речи
        .replace(/([.!?])\s*/g, '$1 ')
        .replace(/([,;:])\s*/g, '$1 ')
        // Заменяем сокращения на полные формы
        .replace(/\bт\.?\s*д\.?\b/gi, 'так далее')
        .replace(/\bт\.?\s*к\.?\b/gi, 'так как')
        .replace(/\bт\.?\s*п\.?\b/gi, 'тому подобное')
        .replace(/\bи\.?\s*т\.?\s*д\.?\b/gi, 'и так далее')
        // Улучшаем произношение чисел
        .replace(/\b(\d+)\s*%/g, '$1 процентов')
        .replace(/\b(\d+)\s*км\b/g, '$1 километров')
        .replace(/\b(\d+)\s*м\b/g, '$1 метров')
        // Убираем лишние пробелы
        .replace(/\s+/g, ' ')
        .trim()
    );
  }

  /**
   * Получает список всех голосов из ElevenLabs
   */
  async listVoices() {
    try {
      if (!this.elevenLabsApiKey) {
        return { voices: [], message: 'ElevenLabs API key not configured' };
      }

      const voices = await this.getElevenLabsVoices();

      // Получаем информацию из нашей БД для сопоставления
      const audioRecords = await this.prisma.audio.findMany({
        where: {
          voiceId: { not: null },
          status: 'completed',
        },
        select: {
          id: true,
          voiceId: true,
          createdAt: true,
          originalUrl: true,
        },
      });

      const voicesWithInfo = voices.map((voice) => {
        const dbRecord = audioRecords.find(
          (record) => record.voiceId === voice.voice_id,
        );
        return {
          ...voice,
          dbId: dbRecord?.id,
          createdAt: dbRecord?.createdAt,
          originalUrl: dbRecord?.originalUrl,
        };
      });

      return {
        voices: voicesWithInfo,
        total: voices.length,
        limit: 10, // ElevenLabs free tier limit
        message: `Найдено ${voices.length} голосов из 10 доступных`,
      };
    } catch (error) {
      this.logger.error('Failed to list voices:', error);
      throw new HttpException(
        'Не удалось получить список голосов',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Очищает старые неиспользуемые голоса
   */
  async cleanupOldVoices() {
    try {
      if (!this.elevenLabsApiKey) {
        return { message: 'ElevenLabs API key not configured' };
      }

      const allVoices = await this.getElevenLabsVoices();
      this.logger.log(`Found ${allVoices.length} total voices`);

      // Фильтруем только пользовательские голоса
      const customVoices = allVoices.filter(
        (voice) =>
          voice.category === 'cloned' ||
          voice.category === 'generated' ||
          (voice.name && voice.name.includes('voicemirror')),
      );

      this.logger.log(`Found ${customVoices.length} custom voices for cleanup`);

      if (customVoices.length <= 2) {
        return {
          message: 'Недостаточно пользовательских голосов для очистки',
          deleted: 0,
          remaining: customVoices.length,
          total: allVoices.length,
        };
      }

      // Удаляем все кроме 2 самых новых пользовательских голосов
      const voicesToDelete = customVoices.slice(0, customVoices.length - 2);
      let deletedCount = 0;

      for (const voice of voicesToDelete) {
        try {
          await this.deleteElevenLabsVoice(voice.voice_id);

          // Обновляем статус в нашей БД
          await this.prisma.audio.updateMany({
            where: { voiceId: voice.voice_id },
            data: { status: 'deleted' },
          });

          deletedCount++;
          this.logger.log(
            `Cleaned up voice: ${voice.name} (${voice.voice_id})`,
          );
        } catch (error) {
          this.logger.warn(
            `Failed to delete voice ${voice.voice_id}:`,
            error.message,
          );
        }
      }

      return {
        message: `Успешно удалено ${deletedCount} пользовательских голосов`,
        deleted: deletedCount,
        remaining: customVoices.length - deletedCount,
        total: allVoices.length,
      };
    } catch (error) {
      this.logger.error('Failed to cleanup voices:', error);
      throw new HttpException(
        'Не удалось очистить старые голоса',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Удаляет конкретный голос по ID
   */
  async deleteVoiceById(voiceId: string) {
    try {
      if (!this.elevenLabsApiKey) {
        return { message: 'ElevenLabs API key not configured' };
      }

      // Пытаемся удалить голос
      await this.deleteElevenLabsVoice(voiceId);

      // Обновляем статус в нашей БД
      const updatedRecords = await this.prisma.audio.updateMany({
        where: { voiceId },
        data: { status: 'deleted' },
      });

      this.logger.log(`Successfully deleted voice ${voiceId}`);

      return {
        message: `Голос ${voiceId} успешно удален`,
        voiceId,
        updatedRecords: updatedRecords.count,
      };
    } catch (error) {
      this.logger.error(`Failed to delete voice ${voiceId}:`, error);

      if (error.message.includes('400')) {
        throw new HttpException(
          `Невозможно удалить голос ${voiceId}. Возможно, это системный голос или он используется.`,
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        `Не удалось удалить голос ${voiceId}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
