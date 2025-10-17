# PowerShell script для сборки Wav2Lip Docker образа

Write-Host "Сборка Wav2Lip Docker образа..." -ForegroundColor Yellow

# Проверяем наличие Docker
try {
    docker --version | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker не доступен"
    }
} catch {
    Write-Host "Docker не установлен или не запущен" -ForegroundColor Red
    exit 1
}

# Переходим в директорию проекта
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
$projectRoot = Split-Path -Parent $scriptPath
Set-Location $projectRoot

Write-Host "Текущая директория: $(Get-Location)" -ForegroundColor Green

# Сборка образа
Write-Host "Сборка Docker образа..." -ForegroundColor Yellow

docker-compose build wav2lip

if ($LASTEXITCODE -eq 0) {
    Write-Host "Образ успешно собран!" -ForegroundColor Green
    
    # Запуск сервиса
    Write-Host "Запуск Wav2Lip сервиса..." -ForegroundColor Yellow
    docker-compose up -d wav2lip
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Wav2Lip сервис запущен на порту 5000!" -ForegroundColor Green
        Write-Host "Health check: http://localhost:5000/health" -ForegroundColor Cyan
        
        # Ждем запуска
        Write-Host "Ожидание запуска сервиса..." -ForegroundColor Yellow
        Start-Sleep -Seconds 30
        
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing -TimeoutSec 10
            if ($response.StatusCode -eq 200) {
                Write-Host "Сервис работает корректно!" -ForegroundColor Green
            }
        } catch {
            Write-Host "Сервис может еще загружаться. Проверьте логи: docker-compose logs wav2lip" -ForegroundColor Yellow
        }
    } else {
        Write-Host "Ошибка запуска контейнера" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Ошибка сборки образа" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Wav2Lip Docker setup завершен!" -ForegroundColor Green
Write-Host ""
Write-Host "Команды управления:" -ForegroundColor Yellow
Write-Host "  Статус:     docker-compose ps" -ForegroundColor White
Write-Host "  Логи:       docker-compose logs wav2lip" -ForegroundColor White
Write-Host "  Остановка:  docker-compose stop wav2lip" -ForegroundColor White
Write-Host "  Перезапуск: docker-compose restart wav2lip" -ForegroundColor White