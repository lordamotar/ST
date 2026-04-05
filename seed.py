import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import async_session_maker
from app.models.product import Category, Product

async def seed_data():
    async with async_session_maker() as session:
        # 1. Очистка (опционально)
        # Мы не будем удалять данные, чтобы не рисковать, 
        # но добавим проверку на существующие записи.

        # 2. Создаем категории
        categories_data = [
            {"name": "Стулья", "slug": "chairs", "description": "Эргономичные и стильные стулья для дома и офиса."},
            {"name": "Диваны", "slug": "sofas", "description": "Роскошные диваны с премиальной обивкой."},
            {"name": "Столы", "slug": "tables", "description": "Массивные и современные столы из натурального камня и дерева."},
            {"name": "Шкафы", "slug": "cupboards", "description": "Системы хранения для вашего идеального порядка."},
        ]
        
        categories = {}
        for cat_data in categories_data:
            cat = Category(**cat_data)
            session.add(cat)
            categories[cat_data["slug"]] = cat
        
        await session.flush() # Получаем ID категорий

        # 3. Создаем товары
        products_data = [
            # Стулья
            {"name": "Стул 'Осло' из дуба", "slug": "oslo-oak-chair", "price": 12500, "material": "oak", "color": "natural", "category_id": categories["chairs"].id},
            {"name": "Кресло 'Версаль' изумруд", "slug": "versal-emerald-chair", "price": 24000, "material": "velvet", "color": "emerald", "category_id": categories["chairs"].id},
            
            # Диваны
            {"name": "Диван 'Честерфилд' классик", "slug": "chesterfield-sofa", "price": 85000, "material": "leather", "color": "brown", "category_id": categories["sofas"].id},
            {"name": "Модульный диван 'Cloud'", "slug": "cloud-sofa", "price": 115000, "material": "fabric", "color": "grey", "category_id": categories["sofas"].id},
            
            # Столы
            {"name": "Обеденный стол 'Carrara'", "slug": "carrara-table", "price": 55000, "material": "marble", "color": "white", "category_id": categories["tables"].id},
            {"name": "Рабочий стол 'Loft'", "slug": "loft-desk", "price": 18000, "material": "pine", "color": "black", "category_id": categories["tables"].id},
            
            # Шкафы
            {"name": "Шкаф 'Minimal' орех", "slug": "minimal-walnut-cupboard", "price": 42000, "material": "walnut", "color": "dark", "category_id": categories["cupboards"].id},
        ]
        
        for prod_data in products_data:
            prod = Product(**prod_data)
            session.add(prod)
        
        await session.commit()
        print("Success: Database seeded with initial furniture data!")

if __name__ == "__main__":
    asyncio.run(seed_data())
