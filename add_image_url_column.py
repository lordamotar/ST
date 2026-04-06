"""
Скрипт для добавления колонки image_url в таблицу products.
Запуск: python add_image_url_column.py
"""
import asyncio
from sqlalchemy import text
from app.core.database import engine


async def migrate():
    async with engine.begin() as conn:
        # Проверяем, существует ли уже колонка
        result = await conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'products' AND column_name = 'image_url'
        """))
        if result.fetchone():
            print("✅ Колонка 'image_url' уже существует.")
            return

        # Добавляем колонку
        await conn.execute(text(
            "ALTER TABLE products ADD COLUMN image_url VARCHAR(500)"
        ))
        print("✅ Колонка 'image_url' добавлена в таблицу 'products'!")


if __name__ == "__main__":
    asyncio.run(migrate())
