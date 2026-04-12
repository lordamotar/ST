import asyncio
import sys
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os

# Mock settings for quick test
DATABASE_URL = "postgresql+asyncpg://postgres:postgres@localhost:5432/st_db"

async def test_conn():
    print(f"Testing connection to {DATABASE_URL}...")
    try:
        engine = create_async_engine(DATABASE_URL)
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            print(f"Successfully executed query: {result.scalar()}")
        await engine.dispose()
    except Exception as e:
        print(f"Error connecting to database: {e}")

if __name__ == "__main__":
    asyncio.run(test_conn())
