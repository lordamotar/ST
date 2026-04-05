import asyncio
from app.core.database import async_session_maker
from app.models.product import Product
from sqlalchemy import select, func

async def test():
    print("--- ТЕСТ БАЗЫ ДАННЫХ ---")
    async with async_session_maker() as session:
        # 1. Проверяем все товары
        res = await session.execute(select(Product.name))
        all_names = res.scalars().all()
        print(f"Все товары в базе ({len(all_names)}):", all_names)

        # 2. Проверяем поиск 'дуб'
        q = "дуб"
        search_terms = f"%{q}%"
        query = select(Product).where(
            Product.name.ilike(search_terms) | 
            func.coalesce(Product.description, "").ilike(search_terms)
        )
        res = await session.execute(query)
        found = res.scalars().all()
        print(f"Поиск '{q}' нашел товаров: {len(found)}")
        for p in found:
            print(f" - {p.name}")

if __name__ == "__main__":
    asyncio.run(test())
