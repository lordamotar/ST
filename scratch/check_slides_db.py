import asyncio
from app.core.database import engine
from app.models.slider import Slide
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select

async def check_slides():
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as db:
        res = await db.execute(select(Slide))
        slides = res.scalars().all()
        if not slides:
            print("No slides found in database.")
        for s in slides:
            print(f"ID: {s.id}, Title: {s.title}, URL: {s.image_url}")

if __name__ == "__main__":
    asyncio.run(check_slides())
