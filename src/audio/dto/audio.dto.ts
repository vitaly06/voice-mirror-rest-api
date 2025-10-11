import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class GenerateSpeechDto {
  @ApiProperty({
    description: 'Текст для синтеза речи',
    example: 'Привет, как дела?',
  })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty({
    description: 'ID клонированного голоса из ElevenLabs',
    example: 'voice_id_123456',
  })
  @IsString()
  @IsNotEmpty()
  voiceId: string;
}

export class AudioUploadResponseDto {
  @ApiProperty({
    description: 'ID записи аудио',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'URL оригинального аудиофайла',
    example: 'http://localhost:3000/uploads/audio-1234567890.wav',
  })
  originalUrl: string;

  @ApiProperty({
    description: 'Статус обработки',
    example: 'processing',
    enum: ['processing', 'completed', 'error'],
  })
  status: string;

  @ApiProperty({
    description: 'Сообщение о статусе',
    example: 'Audio uploaded, voice cloning in progress',
  })
  message: string;
}

export class AudioStatusDto {
  @ApiProperty({
    description: 'ID записи аудио',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'URL оригинального аудиофайла',
    example: 'http://localhost:3000/uploads/audio-1234567890.wav',
  })
  originalUrl: string;

  @ApiProperty({
    description: 'URL клонированного голоса',
    example: 'http://localhost:3000/uploads/cloned-1234567890.mp3',
    required: false,
  })
  clonedUrl?: string;

  @ApiProperty({
    description: 'ID голоса в ElevenLabs',
    example: 'voice_id_123456',
    required: false,
  })
  voiceId?: string;

  @ApiProperty({
    description: 'Статус обработки',
    example: 'completed',
    enum: ['processing', 'completed', 'error'],
  })
  status: string;

  @ApiProperty({
    description: 'Дата создания',
    example: '2024-01-01T00:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Дата обновления',
    example: '2024-01-01T00:01:00Z',
  })
  updatedAt: Date;
}

export class ChatResponseDto {
  @ApiProperty({
    description: 'ID ответа',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Вопрос',
    example: 'Как дела?',
  })
  question: string;

  @ApiProperty({
    description: 'URL аудио ответа',
    example: 'http://localhost:3000/uploads/response-1234567890.mp3',
  })
  audioUrl: string;
}

export class GeneratedSpeechDto {
  @ApiProperty({
    description: 'URL сгенерированного аудиофайла',
    example: 'http://localhost:3000/uploads/custom-1234567890.mp3',
  })
  audioUrl: string;

  @ApiProperty({
    description: 'Исходный текст',
    example: 'Привет, как дела?',
  })
  text: string;
}
