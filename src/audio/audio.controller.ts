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
import { AudioService } from './audio.service';
import {
  GenerateSpeechDto,
  AudioUploadResponseDto,
  AudioStatusDto,
  ChatResponseDto,
  GeneratedSpeechDto,
} from './dto/audio.dto';

class FileUploadDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Аудиофайл для загрузки (WAV, MP3, M4A, до 10MB, до 1 минуты)',
  })
  file: any;
}

@ApiTags('🎤 Аудио и Голосовые технологии')
@Controller('audio')
export class AudioController {
  constructor(private readonly audioService: AudioService) {}

  @Post('upload')
  @ApiOperation({
    summary: '📤 Загрузить голосовую запись',
    description:
      'Загружает аудиофайл пользователя и запускает процесс клонирования голоса через ElevenLabs API. Поддерживаются форматы: WAV, MP3, M4A. Максимальный размер: 10MB, рекомендуемая длительность: до 1 минуты.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Аудиофайл для клонирования голоса',
    type: FileUploadDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Аудио успешно загружено, клонирование голоса запущено',
    type: AudioUploadResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Ошибка валидации файла (неверный тип, размер или отсутствие файла)',
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadAudio(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<AudioUploadResponseDto> {
    if (!file) {
      throw new HttpException('Файл не загружен', HttpStatus.BAD_REQUEST);
    }

    // Проверяем тип файла
    const allowedMimes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/m4a'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new HttpException(
        'Неверный тип файла. Разрешены только аудиофайлы: WAV, MP3, M4A',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Проверяем размер файла (максимум 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new HttpException(
        'Файл слишком большой. Максимальный размер: 10MB',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.audioService.uploadAudio(file);
  }

  @Get('status/:id')
  @ApiOperation({
    summary: '📊 Получить статус обработки аудио',
    description:
      'Возвращает текущий статус обработки загруженного аудиофайла и информацию о клонированном голосе.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID аудиозаписи',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Статус аудио успешно получен',
    type: AudioStatusDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Аудиозапись не найдена',
  })
  async getAudioStatus(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AudioStatusDto> {
    return this.audioService.getAudioStatus(id);
  }

  @Get('chat-responses')
  @ApiOperation({
    summary: '💬 Получить готовые ответы для чата',
    description:
      'Возвращает список предзаписанных вопросов и ответов для чат-интерфейса. Можно фильтровать по ID голоса.',
  })
  @ApiQuery({
    name: 'voiceId',
    description: 'ID голоса для фильтрации ответов (необязательно)',
    required: false,
    example: 'voice_id_123456',
  })
  @ApiResponse({
    status: 200,
    description: 'Список ответов успешно получен',
    type: [ChatResponseDto],
  })
  async getChatResponses(
    @Query('voiceId') voiceId?: string,
  ): Promise<ChatResponseDto[]> {
    return this.audioService.getChatResponses(voiceId);
  }

  @Post('generate-speech')
  @ApiOperation({
    summary: '🗣️ Синтезировать речь',
    description:
      'Генерирует аудиофайл из текста, используя клонированный голос пользователя через ElevenLabs API.',
  })
  @ApiBody({
    description: 'Данные для синтеза речи',
    type: GenerateSpeechDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Речь успешно синтезирована',
    type: GeneratedSpeechDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Отсутствуют обязательные поля: text или voiceId',
  })
  @ApiResponse({
    status: 500,
    description: 'Ошибка синтеза речи',
  })
  async generateSpeech(
    @Body(ValidationPipe) body: GenerateSpeechDto,
  ): Promise<GeneratedSpeechDto> {
    return this.audioService.generateCustomResponse(body.text, body.voiceId);
  }
}
