import asyncio
from app.core.database import engine
from app.models.page import StaticPage
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker

async def seed_404():
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as db:
        new_page = StaticPage(
            slug="404",
            title="Страница не найдена",
            content="Похоже, эта страница была перемещена или её никогда не существовало. Попробуйте начать с главной."
        )
        db.add(new_page)
        await db.commit()
        print("404 Page seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_404())
