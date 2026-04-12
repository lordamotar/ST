import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

DATABASE_URL = "postgresql+asyncpg://postgres:postgres@localhost:5432/st_db"

async def add_columns():
    engine = create_async_engine(DATABASE_URL)
    async with engine.connect() as conn:
        print("Adding promo columns to 'products' table...")
        try:
            # Postgres syntax for adding columns
            await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS promo_start TIMESTAMP WITHOUT TIME ZONE"))
            await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS promo_end TIMESTAMP WITHOUT TIME ZONE"))
            await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS show_timer BOOLEAN DEFAULT FALSE"))
            await conn.commit()
            print("Successfully added columns (or they already existed).")
        except Exception as e:
            print(f"Error adding columns: {e}")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(add_columns())
