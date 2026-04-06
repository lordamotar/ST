import asyncio
from sqlalchemy import text
from app.core.database import engine

async def migrate():
    async with engine.begin() as conn:
        result = await conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'products' AND column_name = 'characteristics'
        """))
        if result.fetchone():
            print("✅ Колонка 'characteristics' уже существует.")
            return

        await conn.execute(text(
            "ALTER TABLE products ADD COLUMN characteristics JSON DEFAULT '{}'::json"
        ))
        print("✅ Колонка 'characteristics' добавлена в таблицу 'products'!")

if __name__ == "__main__":
    asyncio.run(migrate())
