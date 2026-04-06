"""
Объединённая миграция: добавляет все недостающие колонки
"""
import asyncio
from sqlalchemy import text
from app.core.database import engine

MIGRATIONS = [
    # Категории — статус активности
    "ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE",
    # Заказы — трекинг обработки
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS processed_by VARCHAR(100)",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS modified_by VARCHAR(100)",
]

async def main():
    async with engine.begin() as conn:
        for sql in MIGRATIONS:
            try:
                await conn.execute(text(sql))
                col = sql.split("ADD COLUMN IF NOT EXISTS")[1].strip().split()[0]
                print(f"  ✅  {col}")
            except Exception as e:
                print(f"  ⚠️  {e}")
    print("\nМиграция завершена!")

if __name__ == "__main__":
    asyncio.run(main())
