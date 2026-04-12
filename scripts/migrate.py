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
from app.core.database import engine, Base
from loguru import logger

# Импортируем все модели для регистрации в Base.metadata
from app.models.user import User
from app.models.product import Product, Category
from app.models.order import Order
from app.models.faq import FAQ
from app.models.slider import Slide
from app.models.settings import SiteSettings
from app.models.page import StaticPage

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
]

async def main():
    async with engine.begin() as conn:
        logger.info("🚀 Проверка и создание таблиц по моделям...")
        # Создаем таблицы из моделей (если их нет)
        await conn.run_sync(Base.metadata.create_all)
        logger.success("✔️ Базовая схема синхронизирована")

        logger.info("🚀 Запуск дополнительных миграций (SQL)...")
        for sql in MIGRATIONS:
            try:
                await conn.execute(text(sql))
                # Красивый лог (упрощенный)
                logger.info(f"✔️ SQL выполнен: {sql[:60]}...")
            except Exception as e:
                # Игнорируем ошибки если таблица/колонка уже есть (хотя IF NOT EXISTS подстраховывает)
                logger.debug(f"ℹ️ SQL инфо: {sql[:50]}... -> {e}")
    
    logger.success("✨ Миграция успешно завершена!")

if __name__ == "__main__":
    asyncio.run(main())
