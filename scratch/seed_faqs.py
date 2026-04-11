import asyncio
from app.core.database import engine
from app.models.faq import FAQ
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker

async def seed_faqs():
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as db:
        initial_faqs = [
            {
                "question": "Вся ли мебель есть в наличии?",
                "answer": "Да, наша специализация — готовая мебель. Все товары, представленные в каталоге со статусом «В наличии», находятся на нашем складе и готовы к отправке в день заказа.",
                "order": 1
            },
            {
                "question": "Как быстро осуществляется доставка?",
                "answer": "По городу Семей доставка осуществляется в течение 24 часов. В другие регионы отправка производится через транспортные компании, срок зависит от удаленности региона.",
                "order": 2
            },
            {
                "question": "Предоставляете ли вы услуги сборки?",
                "answer": "Для жителей Семея доступна профессиональная сборка нашими мастерами в день доставки. Для иногородних заказов каждое изделие комплектуется подробной инструкцией.",
                "order": 3
            },
            {
                "question": "Какая гарантия на мебель?",
                "answer": "Мы уверены в качестве своего производства, поэтому даем полную гарантию 24 месяца на все конструктивные элементы и фурнитуру.",
                "order": 4
            }
        ]
        
        for item in initial_faqs:
            db.add(FAQ(**item))
        
        await db.commit()
        print("Initial FAQs seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_faqs())
