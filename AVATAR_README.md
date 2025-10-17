# 🎭 Avatar & Wav2Lip Integration

## Описание функциональности

VoiceMirror теперь поддерживает создание анимированных аватаров с синхронизацией губ через технологию Wav2Lip.

## 🎯 Возможности

### 📸 Создание аватара

- Загрузка статичного фото лица
- Поддержка форматов: JPG, PNG
- Автоматическое сохранение в базе данных

### 🎬 Анимация аватара

- Синтез речи с клонированным голосом
- Генерация видео с анимированными губами
- Синхронизация движения губ с речью

### 📊 Отслеживание статуса

- Мониторинг процесса обработки
- История всех анимаций аватара

## 🚀 API Endpoints

### 1. Загрузка фото аватара

```
POST /avatar/upload
Content-Type: multipart/form-data

Form fields:
- image: файл изображения (JPG/PNG, до 5MB)
- name: название аватара
- description: описание (необязательно)
```

**Пример ответа:**

```json
{
  "id": 1,
  "name": "Мой аватар",
  "imageUrl": "http://localhost:3000/uploads/avatar-1234567890.jpg",
  "message": "Аватар успешно создан"
}
```

### 2. Получить список аватаров

```
GET /avatar
```

**Пример ответа:**

```json
[
  {
    "id": 1,
    "name": "Мой аватар",
    "imageUrl": "http://localhost:3000/uploads/avatar-1234567890.jpg",
    "description": "Описание аватара",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

### 3. Анимировать аватар

```
POST /avatar/animate
Content-Type: application/json

{
  "avatarId": 1,
  "text": "Привет! Меня зовут Виктор.",
  "voiceId": "voice_id_123456"  // Необязательно
}
```

**Пример ответа:**

```json
{
  "id": 1,
  "avatarId": 1,
  "audioUrl": "http://localhost:3000/uploads/speech-1234567890.mp3",
  "videoUrl": "", // Заполнится после обработки
  "text": "Привет! Меня зовут Виктор.",
  "status": "processing",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### 4. Проверить статус анимации

```
GET /avatar/animations/{id}/status
```

**Пример ответа:**

```json
{
  "id": 1,
  "avatarId": 1,
  "audioUrl": "http://localhost:3000/uploads/speech-1234567890.mp3",
  "videoUrl": "http://localhost:3000/uploads/animated-1234567890.mp4",
  "text": "Привет! Меня зовут Виктор.",
  "status": "completed",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### 5. Получить анимации аватара

```
GET /avatar/{avatarId}/animations
```

## 🛠️ Настройка Wav2Lip

### Локальная разработка

1. **Скачайте предобученную модель:**

```bash
cd wav2lip/checkpoints
wget "https://iiitaphyd-my.sharepoint.com/:u:/g/personal/radrabha_m_research_iiit_ac_in/Eb3LEzbfuKlJiR600lQWRxgBIY27JZdBBREYI_Gbb6h6Kw" -O wav2lip_gan.pth
```

2. **Установите Python зависимости:**

```bash
pip install numpy opencv-python librosa scipy tqdm numba
```

3. **Установите FFmpeg:**

```bash
# Windows (Chocolatey)
choco install ffmpeg

# macOS (Homebrew)
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg
```

4. **Настройте переменную окружения:**

```bash
# В .env файле
WAV2LIP_PATH="./wav2lip"
```

### Docker развертывание

Docker образ уже включает все необходимые зависимости:

- Python 3 + pip
- FFmpeg
- OpenCV
- NumPy, SciPy, Librosa

```bash
# Сборка с поддержкой Wav2Lip
docker-compose up --build
```

## 📋 Workflow для фронтенда

### 1. Создание аватара

```javascript
// Загрузка фото аватара
const formData = new FormData();
formData.append('image', avatarPhoto);
formData.append('name', 'Мой аватар');
formData.append('description', 'Описание');

const avatar = await fetch('/avatar/upload', {
  method: 'POST',
  body: formData,
}).then((r) => r.json());

console.log('Аватар создан:', avatar);
```

### 2. Анимация аватара

```javascript
// Запуск анимации
const animation = await fetch('/avatar/animate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    avatarId: 1,
    text: 'Привет! Как дела?',
    voiceId: 'voice_id_123456', // Из клонированных голосов
  }),
}).then((r) => r.json());

// Проверяем статус каждые 2 секунды
const checkStatus = setInterval(async () => {
  const status = await fetch(`/avatar/animations/${animation.id}/status`).then(
    (r) => r.json(),
  );

  if (status.status === 'completed') {
    console.log('Видео готово:', status.videoUrl);

    // Показываем видео пользователю
    const video = document.createElement('video');
    video.src = status.videoUrl;
    video.controls = true;
    document.body.appendChild(video);

    clearInterval(checkStatus);
  } else if (status.status === 'error') {
    console.error('Ошибка создания анимации');
    clearInterval(checkStatus);
  }
}, 2000);
```

### 3. Управление аватарами

```javascript
// Получить все аватары
const avatars = await fetch('/avatar').then((r) => r.json());

// Получить анимации конкретного аватара
const animations = await fetch(`/avatar/${avatarId}/animations`).then((r) =>
  r.json(),
);
```

## 🔧 Технические детали

### Обработка файлов

- **Изображения**: JPG, PNG до 5MB
- **Видео**: MP4 формат на выходе
- **Разрешение**: 512x512 пикселей (настраивается)

### Производительность

- Время обработки: 30-60 секунд на 10 секунд речи
- Рекомендуется использовать GPU для ускорения (в Docker)
- Фоновая обработка не блокирует API

### Масштабирование

- Возможна интеграция с внешними сервисами обработки
- Поддержка очередей для массовой обработки
- Кэширование результатов

## 🚨 Ограничения

### Текущая версия (Demo):

- Используется FFmpeg для создания простого видео
- Настоящий Wav2Lip требует установки модели
- Ограниченное качество без GPU

### Для продакшена:

- Установите настоящую модель Wav2Lip
- Используйте GPU для ускорения
- Настройте мониторинг процессов

## 📚 Swagger документация

Полная интерактивная документация доступна по адресу:

```
http://localhost:3000/api
```

В разделе "🎭 Аватар и анимация лица" вы найдете все методы с примерами запросов и ответов.

## 🔗 Полезные ссылки

- [Официальный Wav2Lip репозиторий](https://github.com/Rudrabha/Wav2Lip)
- [Предобученная модель](https://iiitaphyd-my.sharepoint.com/:u:/g/personal/radrabha_m_research_iiit_ac_in/Eb3LEzbfuKlJiR600lQWRxgBIY27JZdBBREYI_Gbb6h6Kw)
- [FFmpeg документация](https://ffmpeg.org/documentation.html)
