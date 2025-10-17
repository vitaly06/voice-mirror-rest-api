import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAvatarDto {
  @ApiProperty({
    description: 'Название аватара',
    example: 'Мой виртуальный двойник',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Описание аватара',
    example: 'Аватар с моим лицом для презентаций',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}

export class AvatarResponseDto {
  @ApiProperty({
    description: 'ID аватара',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Название аватара',
    example: 'Мой виртуальный двойник',
  })
  name: string;

  @ApiProperty({
    description: 'URL фотографии аватара',
    example: 'http://localhost:3000/uploads/avatar-1234567890.jpg',
  })
  imageUrl: string;

  @ApiProperty({
    description: 'Описание аватара',
    example: 'Аватар с моим лицом для презентаций',
    required: false,
  })
  description?: string;

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

export class AnimateAvatarDto {
  @ApiProperty({
    description: 'ID аватара для анимации',
    example: 1,
  })
  @IsNotEmpty()
  avatarId: number;

  @ApiProperty({
    description: 'Текст, который должен произнести аватар',
    example: 'Привет! Меня зовут Виктор, и я ваш виртуальный помощник.',
  })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty({
    description: 'ID голоса для синтеза речи (из клонированных голосов)',
    example: 'voice_id_123456',
    required: false,
  })
  @IsString()
  @IsOptional()
  voiceId?: string;
}

export class AvatarAnimationResponseDto {
  @ApiProperty({
    description: 'ID анимации',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'ID аватара',
    example: 1,
  })
  avatarId: number;

  @ApiProperty({
    description: 'URL аудиофайла',
    example: 'http://localhost:3000/uploads/speech-1234567890.mp3',
  })
  audioUrl: string;

  @ApiProperty({
    description: 'URL видео с анимированными губами',
    example: 'http://localhost:3000/uploads/animated-1234567890.mp4',
    required: false,
  })
  videoUrl?: string;

  @ApiProperty({
    description: 'Текст, который произносит аватар',
    example: 'Привет! Меня зовут Виктор.',
  })
  text: string;

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
}

export class AvatarUploadResponseDto {
  @ApiProperty({
    description: 'ID созданного аватара',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Название аватара',
    example: 'Мой виртуальный двойник',
  })
  name: string;

  @ApiProperty({
    description: 'URL загруженного фото',
    example: 'http://localhost:3000/uploads/avatar-1234567890.jpg',
  })
  imageUrl: string;

  @ApiProperty({
    description: 'Сообщение о статусе',
    example: 'Аватар успешно создан',
  })
  message: string;
}
