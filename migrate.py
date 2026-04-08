"""
Объединённая миграция: добавляет все недостающие колонки
"""
import asyncio
from sqlalchemy import text
from app.core.database import engine

MIGRATIONS = [
    # Категории — статус активности
    "ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE",
    
    # Товары — Новая система цен (Renaming price -> new_price)
    # Используем анонимный блок для PostgreSQL, чтобы безопасно переименовать если колонка существует
    "DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='price') THEN ALTER TABLE products RENAME COLUMN price TO new_price; END IF; END $$;",
    "ALTER TABLE products ADD COLUMN IF NOT EXISTS old_price FLOAT DEFAULT 0",
    
    # Заказы — трекинг обработки
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS processed_by VARCHAR(100)",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS modified_by VARCHAR(100)",

    # Пользователи: добавляем новые поля
    "ALTER TABLE users ALTER COLUMN telegram_id DROP NOT NULL",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50) UNIQUE",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS hashed_password VARCHAR(255)",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'client'",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(255) UNIQUE",
    # Создание таблицы настроек
    "CREATE TABLE IF NOT EXISTS site_settings (id SERIAL PRIMARY KEY, key VARCHAR(50) UNIQUE NOT NULL, value TEXT)",
]

async def main():
    async with engine.begin() as conn:
        print("Starting migrations...")
        for sql in MIGRATIONS:
            try:
                await conn.execute(text(sql))
                # Выводим краткое описание действия
                if "DO $$" in sql: desc = "Rename price -> new_price"
                elif "CREATE TABLE" in sql: desc = f"Create table: {sql.split('CREATE TABLE IF NOT EXISTS ')[1].split()[0]}"
                elif "ADD COLUMN" in sql: desc = f"Add column: {sql.split('ADD COLUMN IF NOT EXISTS ')[1].split()[0]}"
                else: desc = "Execute custom SQL"
                print(f"  ✅  {desc}")
            except Exception as e:
                print(f"  ⚠️  Error running SQL: {sql[:50]}... -> {e}")
    print("\nМиграция завершена!")

if __name__ == "__main__":
    asyncio.run(main())
