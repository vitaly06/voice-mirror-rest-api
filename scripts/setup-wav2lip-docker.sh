#!/bin/bash
# Скрипт для сборки и запуска Wav2Lip Docker образа

echo "🚀 Сборка Wav2Lip Docker образа..."

# Проверяем наличие Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен. Установите Docker Desktop для Windows."
    exit 1
fi

# Переходим в директорию wav2lip
cd "$(dirname "$0")/wav2lip" || exit 1

echo "📁 Текущая директория: $(pwd)"

# Сборка образа
echo "🔨 Сборка Docker образа wav2lip..."
docker build -t wav2lip-service .

if [ $? -eq 0 ]; then
    echo "✅ Образ успешно собран!"
    
    # Запуск контейнера
    echo "▶️ Запуск Wav2Lip сервиса..."
    docker run -d \
        --name wav2lip-service \
        -p 5000:5000 \
        --restart unless-stopped \
        wav2lip-service
    
    if [ $? -eq 0 ]; then
        echo "✅ Wav2Lip сервис запущен на порту 5000!"
        echo "🔗 Проверьте здоровье: http://localhost:5000/health"
        echo "📚 API документация: http://localhost:5000/"
        
        # Ждем запуска и проверяем
        echo "⏳ Ждем запуска сервиса..."
        sleep 30
        
        curl -f http://localhost:5000/health > /dev/null 2>&1
        if [ $? -eq 0 ]; then
            echo "✅ Сервис работает корректно!"
        else
            echo "⚠️ Сервис может еще загружаться. Проверьте логи:"
            echo "docker logs wav2lip-service"
        fi
    else
        echo "❌ Ошибка запуска контейнера"
        exit 1
    fi
else
    echo "❌ Ошибка сборки образа"
    exit 1
fi

echo "🎉 Wav2Lip Docker setup завершен!"
echo ""
echo "Управление контейнером:"
echo "  Статус:     docker ps | grep wav2lip"
echo "  Логи:       docker logs wav2lip-service"
echo "  Остановка:  docker stop wav2lip-service"
echo "  Удаление:   docker rm wav2lip-service"