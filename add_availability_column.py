import asyncio
from sqlalchemy import text
from app.core.database import engine

async def migrate():
    async with engine.begin() as conn:
        try:
            # В PostgreSQL ALTER TABLE ADD COLUMN IF NOT EXISTS доступно начиная с версии 9.6
            await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS availability_status VARCHAR(50) DEFAULT 'in_stock'"))
            print("✅ Колонка 'availability_status' успешно добавлена (или уже существует)!")
        except Exception as e:
            print(f"❌ Ошибка добавления колонки: {e}")

if __name__ == "__main__":
    asyncio.run(migrate())
