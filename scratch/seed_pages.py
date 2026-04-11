import asyncio
from app.core.database import engine
from app.models.page import StaticPage
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker

async def seed_pages():
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as db:
        initial_pages = [
            {
                "slug": "contacts",
                "title": "Контакты",
                "content": "<h2>Наш адрес</h2><p>г. Семей, ул. Примерная, 10</p><h2>Телефон</h2><p>+7 (XXX) XXX-XX-XX</p><h2>Режим работы</h2><p>Пн-Сб: 09:00 - 18:00</p>"
            },
            {
                "slug": "delivery",
                "title": "Доставка и сборка",
                "content": "<h2>Доставка по Семею</h2><p>Осуществляется бесплатно при заказе от 50 000 тг.</p><h2>Сборка</h2><p>Профессиональная сборка мебели в день доставки.</p>"
            },
            {
                "slug": "warranty",
                "title": "Гарантия качества",
                "content": "<p>Мы предоставляем гарантию 24 месяца на все изделия производства Stoly-Sklad.</p>"
            },
            {
                "slug": "returns",
                "title": "Возврат и обмен",
                "content": "<p>Возврат товара надлежащего качества возможен в течение 14 дней.</p>"
            },
            {
                "slug": "offer",
                "title": "Публичная оферта",
                "content": "<p>Текст договора публичной оферты...</p>"
            }
        ]
        
        for item in initial_pages:
            db.add(StaticPage(**item))
        
        await db.commit()
        print("Initial pages seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_pages())
