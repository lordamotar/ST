import asyncio
from app.core.database import engine, Base
from app.models.page import StaticPage

async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        print("DONE: 'static_pages' table created.")

if __name__ == "__main__":
    asyncio.run(create_tables())
