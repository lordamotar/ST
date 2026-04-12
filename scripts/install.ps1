# Скрипт первичной установки проекта Stoly-Sklad
Write-Host "🌟 Начинаем первичную установку проекта..." -ForegroundColor Cyan

# 1. Проверка .env
if (-not (Test-Path .env)) {
    Write-Host "⚠️ Файл .env не найден! Создаю его из примера..." -ForegroundColor Yellow
    # Можно создать дефолтную заглушку если есть пример, либо просто предупредить
    "DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost/st_db`nSECRET_KEY=$( [guid]::NewGuid().ToString() )`nALGORITHM=HS256`nACCESS_TOKEN_EXPIRE_MINUTES=43200" | Out-File -FilePath .env -Encoding utf8
    Write-Host "✅ Файл .env создан. Пожалуйста, проверьте настройки подключения к БД в нем." -ForegroundColor Green
}

# 2. Установка зависимостей Python через uv
Write-Host "`n📦 Установка зависимостей бэкенда (Python/uv)..." -ForegroundColor Yellow
if (Get-Command uv -ErrorAction SilentlyContinue) {
    uv sync
} else {
    Write-Host "⚠️ Инструмент 'uv' не найден. Пытаюсь использовать pip..." -ForegroundColor DarkYellow
    pip install -r requirements.txt
}

# 3. Установка зависимостей фронтенда через npm
Write-Host "`n⚛️ Установка зависимостей фронтенда (Node.js/npm)..." -ForegroundColor Yellow
if (Test-Path frontend) {
    cd frontend
    npm install
    cd ..
} else {
    Write-Host "❌ Папка frontend не найдена!" -ForegroundColor Red
}

# 4. Настройка базы данных
Write-Host "`n🗄️ Настройка базы данных и запуск миграций..." -ForegroundColor Yellow
python scripts/migrate.py

# 5. Создание администратора
Write-Host "`n👤 Создание учетной записи администратора..." -ForegroundColor Yellow
python scripts/setup_admin.py

Write-Host "`n✨ Установка завершена успешно!" -ForegroundColor Green
Write-Host "Чтобы запустить проект, используйте:"
Write-Host "  1. Backend: uvicorn app.main:app --reload"
Write-Host "  2. Frontend: cd frontend; npm run dev"
