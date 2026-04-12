# Скрипт обновления проекта
Write-Host "🚀 Обновление проекта..." -ForegroundColor Cyan

# 1. Тянем изменения из Git
Write-Host "📥 Получение обновлений из репозитория..." -ForegroundColor Yellow
git pull origin master

# 2. Обновление зависимостей бэкенда
Write-Host "📦 Обновление зависимостей Python (uv)..." -ForegroundColor Yellow
uv sync

# 3. Миграция БД
Write-Host "🗄️ Запуск миграций базы данных..." -ForegroundColor Yellow
python scripts/migrate.py

# 4. Обновление зависимостей фронтенда
Write-Host "⚛️ Обновление зависимостей NPM..." -ForegroundColor Yellow
cd frontend
npm install
cd ..

Write-Host "✨ Проект успешно обновлен!" -ForegroundColor Green
