# PowerShell скрипт для сборки и запуска Wav2Lip Docker образа

Write-Host "🚀 Сборка Wav2Lip Docker образа..." -ForegroundColor Yellow

# Проверяем наличие Docker
try {
    docker --version | Out-Null
} catch {
    Write-Host "❌ Docker не установлен. Установите Docker Desktop для Windows." -ForegroundColor Red
    exit 1
}

# Переходим в директорию проекта
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
$projectRoot = Split-Path -Parent $scriptPath
Set-Location $projectRoot

Write-Host "📁 Текущая директория: $(Get-Location)" -ForegroundColor Green

# Сборка образа с помощью docker-compose
Write-Host "🔨 Сборка Docker образа через docker-compose..." -ForegroundColor Yellow

try {
    docker-compose build wav2lip
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Образ успешно собран!" -ForegroundColor Green
        
        # Запуск только wav2lip сервиса
        Write-Host "▶️ Запуск Wav2Lip сервиса..." -ForegroundColor Yellow
        docker-compose up -d wav2lip
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Wav2Lip сервис запущен на порту 5000!" -ForegroundColor Green
            Write-Host "🔗 Проверьте здоровье: http://localhost:5000/health" -ForegroundColor Cyan
            Write-Host "📚 API документация: http://localhost:5000/" -ForegroundColor Cyan
            
            # Ждем запуска и проверяем
            Write-Host "⏳ Ждем запуска сервиса..." -ForegroundColor Yellow
            Start-Sleep -Seconds 30
            
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing -TimeoutSec 10
                if ($response.StatusCode -eq 200) {
                    Write-Host "✅ Сервис работает корректно!" -ForegroundColor Green
                } else {
                    Write-Host "⚠️ Сервис отвечает с кодом: $($response.StatusCode)" -ForegroundColor Yellow
                }
            } catch {
                Write-Host "⚠️ Сервис может еще загружаться. Проверьте логи:" -ForegroundColor Yellow
                Write-Host "docker-compose logs wav2lip" -ForegroundColor White
            }
        } else {
            Write-Host "❌ Ошибка запуска контейнера" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "❌ Ошибка сборки образа" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Ошибка выполнения: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "🎉 Wav2Lip Docker setup завершен!" -ForegroundColor Green
Write-Host ""
Write-Host "Управление контейнером:" -ForegroundColor Yellow
Write-Host "  Статус:     docker-compose ps" -ForegroundColor White
Write-Host "  Логи:       docker-compose logs wav2lip" -ForegroundColor White
Write-Host "  Остановка:  docker-compose stop wav2lip" -ForegroundColor White
Write-Host "  Перезапуск: docker-compose restart wav2lip" -ForegroundColor White
Write-Host "  Удаление:   docker-compose down wav2lip" -ForegroundColor White