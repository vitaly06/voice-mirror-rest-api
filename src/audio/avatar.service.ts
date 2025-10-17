import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AudioService } from './audio.service';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import {
  CreateAvatarDto,
  AvatarResponseDto,
  AnimateAvatarDto,
  AvatarAnimationResponseDto,
  AvatarUploadResponseDto,
} from './dto/avatar.dto';

const execAsync = promisify(exec);

@Injectable()
export class AvatarService {
  private readonly logger = new Logger(AvatarService.name);
  private baseUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly audioService: AudioService,
  ) {
    this.baseUrl = this.configService.get<string>(
      'BASE_URL',
      'http://localhost:3000',
    );
  }

  /**
   * Создает аватар из загруженного фото
   */
  async createAvatar(
    file: Express.Multer.File,
    createAvatarDto: CreateAvatarDto,
  ): Promise<AvatarUploadResponseDto> {
    try {
      this.logger.log(`Creating avatar: ${createAvatarDto.name}`);

      const imageUrl = `${this.baseUrl}/uploads/${file.filename}`;

      const avatar = await this.prisma.avatar.create({
        data: {
          name: createAvatarDto.name,
          imageUrl,
          description: createAvatarDto.description,
        },
      });

      this.logger.log(`Avatar created with ID: ${avatar.id}`);

      return {
        id: avatar.id,
        name: avatar.name,
        imageUrl: avatar.imageUrl,
        message: 'Аватар успешно создан',
      };
    } catch (error) {
      this.logger.error('Failed to create avatar:', error);
      throw new HttpException(
        'Не удалось создать аватар',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Получает список всех аватаров
   */
  async getAvatars(): Promise<AvatarResponseDto[]> {
    try {
      const avatars = await this.prisma.avatar.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });

      return avatars.map((avatar) => ({
        ...avatar,
        description: avatar.description || undefined,
      }));
    } catch (error) {
      this.logger.error('Failed to get avatars:', error);
      throw new HttpException(
        'Не удалось получить список аватаров',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Получает аватар по ID
   */
  async getAvatarById(id: number): Promise<AvatarResponseDto> {
    try {
      const avatar = await this.prisma.avatar.findUnique({
        where: { id },
      });

      if (!avatar) {
        throw new HttpException('Аватар не найден', HttpStatus.NOT_FOUND);
      }

      return {
        ...avatar,
        description: avatar.description || undefined,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error('Failed to get avatar:', error);
      throw new HttpException(
        'Не удалось получить аватар',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Анимирует аватар (заглушка - wav2lip удален)
   */
  async animateAvatar(
    animateDto: AnimateAvatarDto,
  ): Promise<AvatarAnimationResponseDto> {
    try {
      this.logger.log(`Creating animation for avatar ${animateDto.avatarId}`);

      // Проверяем, существует ли аватар
      const avatar = await this.getAvatarById(animateDto.avatarId);

      // Генерируем речь из текста
      let audioUrl: string;
      if (animateDto.voiceId) {
        // Используем клонированный голос
        const speechResult = await this.audioService.generateCustomResponse(
          animateDto.text,
          animateDto.voiceId,
        );
        audioUrl = speechResult.audioUrl;
      } else {
        // Создаем временный аудиофайл с TTS (mock для примера)
        audioUrl = await this.createMockAudio(animateDto.text);
      }

      // Создаем запись об анимации в БД (без обработки видео)
      const animation = await this.prisma.avatarAnimation.create({
        data: {
          avatarId: animateDto.avatarId,
          audioUrl,
          videoUrl: avatar.imageUrl, // Используем исходное изображение как "видео"
          text: animateDto.text,
          voiceId: animateDto.voiceId,
          status: 'completed', // Сразу помечаем как завершенное
        },
      });

      this.logger.log(`Animation created with ID: ${animation.id}`);

      return {
        id: animation.id,
        avatarId: animation.avatarId,
        audioUrl: animation.audioUrl,
        videoUrl: animation.videoUrl,
        text: animation.text || '',
        status: animation.status,
        createdAt: animation.createdAt,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error('Failed to create animation:', error);
      throw new HttpException(
        'Не удалось создать анимацию аватара',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Создает мок аудиофайл
   */
  private async createMockAudio(text: string): Promise<string> {
    const fileName = `mock_audio_${Date.now()}.mp3`;
    const filePath = path.join('./uploads', fileName);

    // Создаем заглушку аудиофайла
    const mockContent = `Mock audio for text: ${text}`;
    fs.writeFileSync(filePath, mockContent);

    return `${this.baseUrl}/uploads/${fileName}`;
  }

  /**
   * Преобразует URL в локальный путь к файлу
   */
  private getLocalPathFromUrl(url: string): string {
    const fileName = url.split('/').pop();
    return path.join('./uploads', fileName || '');
  }

  /**
   * Получает статус анимации
   */
  async getAnimationStatus(id: number): Promise<AvatarAnimationResponseDto> {
    try {
      const animation = await this.prisma.avatarAnimation.findUnique({
        where: { id },
      });

      if (!animation) {
        throw new HttpException('Анимация не найдена', HttpStatus.NOT_FOUND);
      }

      return {
        id: animation.id,
        avatarId: animation.avatarId,
        audioUrl: animation.audioUrl,
        videoUrl: animation.videoUrl,
        text: animation.text || '',
        status: animation.status,
        createdAt: animation.createdAt,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error('Failed to get animation status:', error);
      throw new HttpException(
        'Не удалось получить статус анимации',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Получает все анимации аватара
   */
  async getAvatarAnimations(
    avatarId: number,
  ): Promise<AvatarAnimationResponseDto[]> {
    try {
      const animations = await this.prisma.avatarAnimation.findMany({
        where: { avatarId },
        orderBy: { createdAt: 'desc' },
      });

      return animations.map((animation) => ({
        id: animation.id,
        avatarId: animation.avatarId,
        audioUrl: animation.audioUrl,
        videoUrl: animation.videoUrl,
        text: animation.text || '',
        status: animation.status,
        createdAt: animation.createdAt,
      }));
    } catch (error) {
      this.logger.error('Failed to get avatar animations:', error);
      throw new HttpException(
        'Не удалось получить анимации аватара',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
