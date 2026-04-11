import asyncio
from app.core.database import engine, Base
from app.models.faq import FAQ

async def create_tables():
    async with engine.begin() as conn:
        print("Creating tables...")
        await conn.run_sync(Base.metadata.create_all)
        print("DONE: 'faqs' table should be created.")

if __name__ == "__main__":
    asyncio.run(create_tables())
