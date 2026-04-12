#!/bin/bash

# Скрипт деплоя (Linux)
echo -e "\e[36m🚢 Запуск деплоя проекта...\e[0m"

# 1. Сборка фронтенда
echo -e "\e[33m🏗️ Сборка фронтенда (Next.js)...\e[0m"
cd frontend
npm run build
if [ $? -ne 0 ]; then
    echo -e "\e[31m❌ Ошибка сборки фронтенда!\e[0m"
    exit 1
fi
cd ..

# 2. Очистка кэша
echo -e "\e[33m🧹 Очистка временных файлов...\e[0m"
find . -type d -name "__pycache__" -exec rm -rf {} +
find . -type f -name "*.pyc" -delete

echo -e "\n\e[32m✅ Деплой подготовлен!\e[0m"
echo "Сборка фронтенда завершена. Перезапустите системные службы (pm2/systemd) для применения изменений."
