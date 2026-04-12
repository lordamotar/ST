#!/bin/bash

# Скрипт первичной установки проекта Stoly-Sklad (Linux)
echo -e "\e[36m🌟 Начинаем первичную установку проекта...\e[0m"

# 1. Проверка .env
if [ ! -f .env ]; then
    echo -e "\e[33m⚠️ Файл .env не найден! Создаю его из примера...\e[0m"
    UUID=$(cat /proc/sys/kernel/random/uuid)
    echo "DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost/st_db
SECRET_KEY=$UUID
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200" > .env
    echo -e "\e[32m✅ Файл .env создан. Проверьте настройки БД.\e[0m"
fi

# 2. Установка зависимостей Python (uv или pip)
echo -e "\n\e[33m📦 Установка зависимостей бэкенда...\e[0m"
if command -v uv &> /dev/null; then
    uv sync
else
    echo -e "\e[33m⚠️ 'uv' не найден. Использую pip...\e[0m"
    pip install -r requirements.txt
fi

# 3. Установка зависимостей фронтенда
echo -e "\n\e[33m⚛️ Установка зависимостей фронтенда...\e[0m"
if [ -d "frontend" ]; then
    cd frontend
    npm install
    cd ..
else
    echo -e "\e[31m❌ Папка frontend не найдена!\e[0m"
fi

# 4. Настройка базы данных
echo -e "\n\e[33m🗄️ Настройка базы данных и запуск миграций...\e[0m"
python3 scripts/migrate.py

# 5. Создание администратора
echo -e "\n\e[33m👤 Создание учетной записи администратора...\e[0m"
python3 scripts/setup_admin.py

echo -e "\n\e[32m✨ Установка завершена успешно!\e[0m"
echo "Для запуска:"
echo "  1. Backend: uvicorn app.main:app --host 0.0.0.0 --port 8000"
echo "  2. Frontend: cd frontend && npm run dev (или build && start)"
