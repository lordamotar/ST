"""
Объединённая миграция: добавляет все недостающие колонки и таблицы
"""
import asyncio
import sys
import os

# Добавляем корень проекта в путь поиска модулей
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from sqlalchemy import text
from app.core.database import engine
from loguru import logger

MIGRATIONS = [
    # Категории
    "ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE",
    
    # Товары: Переименование и цены
    "DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='price') THEN ALTER TABLE products RENAME COLUMN price TO new_price; END IF; END $$;",
    "ALTER TABLE products ADD COLUMN IF NOT EXISTS old_price FLOAT DEFAULT 0",
    "ALTER TABLE products ADD COLUMN IF NOT EXISTS is_bestseller BOOLEAN DEFAULT FALSE",
    
    # Товары: Акции и Таймер (НОВОЕ)
    "ALTER TABLE products ADD COLUMN IF NOT EXISTS show_timer BOOLEAN DEFAULT FALSE",
    "ALTER TABLE products ADD COLUMN IF NOT EXISTS promo_start TIMESTAMP",
    "ALTER TABLE products ADD COLUMN IF NOT EXISTS promo_end TIMESTAMP",

    # Заказы
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS processed_by VARCHAR(100)",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS modified_by VARCHAR(100)",

    # Пользователи
    "ALTER TABLE users ALTER COLUMN telegram_id DROP NOT NULL",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50) UNIQUE",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS hashed_password VARCHAR(255)",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'client'",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(255) UNIQUE",

    # Создание таблиц если их нет
    "CREATE TABLE IF NOT EXISTS site_settings (id SERIAL PRIMARY KEY, key VARCHAR(50) UNIQUE NOT NULL, value TEXT)",
    "CREATE TABLE IF NOT EXISTS slides (id SERIAL PRIMARY KEY, title VARCHAR(255), description TEXT, image_url VARCHAR(500), start_date TIMESTAMP, end_date TIMESTAMP, show_timer BOOLEAN DEFAULT FALSE, is_active BOOLEAN DEFAULT TRUE, \"order\" INTEGER DEFAULT 0)",
    "CREATE TABLE IF NOT EXISTS faqs (id SERIAL PRIMARY KEY, question TEXT NOT NULL, answer TEXT NOT NULL, is_active BOOLEAN DEFAULT TRUE, \"order\" INTEGER DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    "CREATE TABLE IF NOT EXISTS static_pages (id SERIAL PRIMARY KEY, title VARCHAR(255) NOT NULL, slug VARCHAR(255) UNIQUE NOT NULL, content TEXT NOT NULL, is_active BOOLEAN DEFAULT TRUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
]

async def main():
    async with engine.begin() as conn:
        logger.info("🚀 Запуск миграций...")
        for sql in MIGRATIONS:
            try:
                await conn.execute(text(sql))
                # Красивый лог
                if "CREATE TABLE" in sql:
                    table = sql.split("CREATE TABLE IF NOT EXISTS ")[1].split()[0]
                    logger.success(f"✔️ Таблица создана/проверена: {table}")
                elif "ADD COLUMN" in sql:
                    col = sql.split("ADD COLUMN IF NOT EXISTS ")[1].split()[0]
                    logger.success(f"✔️ Колонка добавлена/проверена: {col}")
                elif "RENAME COLUMN" in sql:
                    logger.success("✔️ Переименование: price -> new_price")
                else:
                    logger.info("✔️ Скрипт выполнен")
            except Exception as e:
                logger.error(f"❌ Ошибка в SQL: {sql[:50]}... -> {e}")
    
    logger.success("✨ Миграция успешно завершена!")

if __name__ == "__main__":
    asyncio.run(main())
