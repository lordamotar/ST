# Скрипт деплоя (сборка и перезапуск)
Write-Host "🚢 Запуск деплоя проекта..." -ForegroundColor Cyan

# 1. Сборка фронтенда
Write-Host "🏗️ Сборка фронтенда (Next.js)..." -ForegroundColor Yellow
cd frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка сборки фронтенда!" -ForegroundColor Red
    exit $LASTEXITCODE
}
cd ..

# 2. Очистка кэша
Write-Host "🧹 Очистка временных файлов..." -ForegroundColor Yellow
Get-ChildItem -Path . -Filter "__pycache__" -Recurse | Remove-Item -Recurse -Force

# 3. Инструкция для перезапуска
Write-Host "`n✅ Деплой подготовлен!" -ForegroundColor Green
Write-Host "Сборка фронтенда завершена в папке frontend/.next (или out)"
Write-Host "Перезапустите сервисы uvicorn и next dev / start для применения изменений."
