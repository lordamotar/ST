import asyncio
from datetime import datetime, timedelta
from app.core.database import async_session_maker
from app.models.slider import Slide
from sqlalchemy import select, delete

async def add_initial_slides():
    async with async_session_maker() as db:
        # Clear existing slides
        await db.execute(delete(Slide))
        
        slides_data = [
            {
                "title": "Весна в новом цвете",
                "description": "Откройте коллекцию обеденных групп из массива дуба. Природная красота дерева в современном исполнении.",
                "image_url": "/uploads/slider/slide1.png",
                "start_date": datetime.utcnow(),
                "end_date": datetime.utcnow() + timedelta(days=30),
                "show_timer": False,
                "is_active": True,
                "order": 1
            },
            {
                "title": "Ожившая эргономика",
                "description": "Стулья серии Elite — это безупречный баланс формы и комфорта. Для тех, кто ценит детали и премиальные материалы.",
                "image_url": "/uploads/slider/slide2.png",
                "start_date": datetime.utcnow(),
                "end_date": datetime.utcnow() + timedelta(days=14),
                "show_timer": False,
                "is_active": True,
                "order": 2
            },
            {
                "title": "Ваше место силы",
                "description": "Создаем интерьеры, в которых хочется просыпаться. Минимализм и уют в каждой линии нашей новой мягкой мебели.",
                "image_url": "/uploads/slider/slide3.png",
                "start_date": datetime.utcnow(),
                "end_date": datetime.utcnow() + timedelta(days=60),
                "show_timer": False,
                "is_active": True,
                "order": 3
            },
            {
                "title": "Мебель по вашим правилам",
                "description": "Мастерство и внимание к каждому заказу. Реализуем ваш проект по индивидуальным размерам с гарантией качества.",
                "image_url": "/uploads/slider/slide4.png",
                "start_date": datetime.utcnow(),
                "end_date": datetime.utcnow() + timedelta(days=7),
                "show_timer": True,
                "is_active": True,
                "order": 4
            }
        ]

        for data in slides_data:
            slide = Slide(**data)
            db.add(slide)
        
        await db.commit()
        print("Successfully added 4 slides to the database.")

if __name__ == "__main__":
    asyncio.run(add_initial_slides())
