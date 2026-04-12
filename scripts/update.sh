#!/bin/bash

# Скрипт обновления проекта (Linux)
echo -e "\e[36m🚀 Обновление проекта...\e[0m"

# 1. Тянем изменения из Git
echo -e "\e[33m📥 Получение обновлений из репозитория...\e[0m"
git pull origin master

# 2. Обновление зависимостей бэкенда
echo -e "\e[33m📦 Обновление зависимостей Python...\e[0m"
if command -v uv &> /dev/null; then
    uv sync
else
    pip install -r requirements.txt
fi

# 3. Миграция БД
echo -e "\e[33m🗄️ Запуск миграций базы данных...\e[0m"
python3 scripts/migrate.py

# 4. Обновление зависимостей фронтенда
echo -e "\e[33m⚛️ Обновление зависимостей NPM...\e[0m"
cd frontend
npm install
cd ..

echo -e "\e[32m✨ Проект успешно обновлен!\e[0m"
