import asyncio
from app.core.database import engine, Base
# Важно импортировать ВСЕ модели, чтобы Base.metadata знала о всех таблицах
from app.models.product import Category, Product
from app.models.user import User
from app.models.order import Order
from sqlalchemy import text

async def fix_database():
    async with engine.begin() as conn:
        print("Dropping orders table...")
        await conn.execute(text("DROP TABLE IF EXISTS orders CASCADE"))
        print("Recreating all tables with updated schema...")
        await conn.run_sync(Base.metadata.create_all)
        print("Done! orders table now has the 'status' column.")

if __name__ == "__main__":
    asyncio.run(fix_database())
