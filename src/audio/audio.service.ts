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
    this.elevenLabsApiKey = this.configService.get<string>('ELEVENLABS_API_KEY') || '';
    
    if (!this.elevenLabsApiKey) {
      this.logger.warn('ElevenLabs API key not configured. Voice cloning will not work.');
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
          this.logger.error(`Voice cloning failed for audio ${audioRecord.id}:`, error);
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
   * Создает голос в ElevenLabs
   */
  private async createElevenLabsVoice(file: Express.Multer.File): Promise<string> {
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
        answer: 'У меня все отлично, спасибо что спросил! Готов к общению.',
      },
      {
        question: 'Расскажи историю',
        answer: 'Когда-то давным-давно жил был один человек, который создал удивительное приложение для клонирования голоса...',
      },
      {
        question: 'Что делаешь?',
        answer: 'Сейчас общаюсь с тобой и это здорово! Могу ответить на твои вопросы.',
      },
      {
        question: 'Как настроение?',
        answer: 'Настроение прекрасное, готов к общению! Что тебя интересует?',
      },
      {
        question: 'Расскажи анекдот',
        answer: 'Встречаются как-то программист и баг. Программист говорит: исправлю тебя! А баг отвечает: попробуй найди!',
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
        this.logger.error(`Failed to create response for: "${question}"`, error);
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
    const response = await fetch(
      `${this.elevenLabsBaseUrl}/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': this.elevenLabsApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
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
        throw new HttpException(
          'Голос не найден',
          HttpStatus.NOT_FOUND,
        );
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
}