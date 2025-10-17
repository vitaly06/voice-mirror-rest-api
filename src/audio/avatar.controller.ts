import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
  ParseIntPipe,
  HttpException,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiProperty,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AvatarService } from './avatar.service';
import {
  CreateAvatarDto,
  AvatarResponseDto,
  AnimateAvatarDto,
  AvatarAnimationResponseDto,
  AvatarUploadResponseDto,
} from './dto/avatar.dto';

class AvatarImageUploadDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Фотография лица для аватара (JPG, PNG, до 5MB)',
  })
  image: any;

  @ApiProperty({
    description: 'Название аватара',
    example: 'Мой виртуальный двойник',
  })
  name: string;

  @ApiProperty({
    description: 'Описание аватара (необязательно)',
    example: 'Аватар для презентаций',
    required: false,
  })
  description?: string;
}

@ApiTags('🎭 Аватар и анимация лица')
@Controller('avatar')
export class AvatarController {
  constructor(private readonly avatarService: AvatarService) {}

  @Post('upload')
  @ApiOperation({
    summary: '📸 Загрузить фото для аватара',
    description:
      'Загружает статичное фото лица для создания аватара. Поддерживаются форматы: JPG, PNG. Рекомендуется четкое фото лица анфас.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Фото лица и информация об аватаре',
    type: AvatarImageUploadDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Аватар успешно создан',
    type: AvatarUploadResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Ошибка валидации файла (неверный тип, размер или отсутствие файла)',
  })
  @UseInterceptors(FileInterceptor('image'))
  async uploadAvatarImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() createAvatarDto: CreateAvatarDto,
  ): Promise<AvatarUploadResponseDto> {
    if (!file) {
      throw new HttpException(
        'Файл изображения не загружен',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Проверяем тип файла
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new HttpException(
        'Неверный тип файла. Разрешены только изображения: JPG, PNG',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Проверяем размер файла (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new HttpException(
        'Файл слишком большой. Максимальный размер: 5MB',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.avatarService.createAvatar(file, createAvatarDto);
  }

  @Get()
  @ApiOperation({
    summary: '📋 Получить список аватаров',
    description: 'Возвращает список всех созданных аватаров пользователя.',
  })
  @ApiResponse({
    status: 200,
    description: 'Список аватаров успешно получен',
    type: [AvatarResponseDto],
  })
  async getAvatars(): Promise<AvatarResponseDto[]> {
    return this.avatarService.getAvatars();
  }

  @Get(':id')
  @ApiOperation({
    summary: '🎭 Получить информацию об аватаре',
    description: 'Возвращает подробную информацию об аватаре по его ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID аватара',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Информация об аватаре успешно получена',
    type: AvatarResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Аватар не найден',
  })
  async getAvatar(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AvatarResponseDto> {
    return this.avatarService.getAvatarById(id);
  }

  @Post('animate')
  @ApiOperation({
    summary: '🎬 Анимировать аватар',
    description: 'Создает видео аватара на основе текста и голоса.',
  })
  @ApiBody({
    description: 'Данные для анимации аватара',
    type: AnimateAvatarDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Анимация запущена, обработка в процессе',
    type: AvatarAnimationResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Аватар не найден',
  })
  @ApiResponse({
    status: 500,
    description: 'Ошибка при создании анимации',
  })
  async animateAvatar(
    @Body(ValidationPipe) animateDto: AnimateAvatarDto,
  ): Promise<AvatarAnimationResponseDto> {
    return this.avatarService.animateAvatar(animateDto);
  }

  @Get('animations/:id/status')
  @ApiOperation({
    summary: '📊 Статус анимации аватара',
    description: 'Проверяет статус обработки анимации аватара по ID анимации.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID анимации',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Статус анимации успешно получен',
    type: AvatarAnimationResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Анимация не найдена',
  })
  async getAnimationStatus(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AvatarAnimationResponseDto> {
    return this.avatarService.getAnimationStatus(id);
  }

  @Get(':avatarId/animations')
  @ApiOperation({
    summary: '🎞️ Получить анимации аватара',
    description: 'Возвращает список всех анимаций для конкретного аватара.',
  })
  @ApiParam({
    name: 'avatarId',
    description: 'ID аватара',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Список анимаций успешно получен',
    type: [AvatarAnimationResponseDto],
  })
  async getAvatarAnimations(
    @Param('avatarId', ParseIntPipe) avatarId: number,
  ): Promise<AvatarAnimationResponseDto[]> {
    return this.avatarService.getAvatarAnimations(avatarId);
  }
}
