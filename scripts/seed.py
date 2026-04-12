import asyncio
import sys
import os
from datetime import datetime, timedelta

# Добавляем корень проекта в путь поиска модулей
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import async_session_maker
from app.models.product import Category, Product
from loguru import logger

async def seed_data():
    async with async_session_maker() as session:
        logger.info("🌱 Запуск наполнения тестовыми данными...")

        # 1. Создаем категории
        categories_data = [
            {"name": "Стулья", "slug": "chairs", "description": "Эргономичные и стильные стулья для дома и офиса."},
            {"name": "Диваны", "slug": "sofas", "description": "Роскошные диваны с премиальной обивкой."},
            {"name": "Столы", "slug": "tables", "description": "Массивные и современные столы из натурального камня и дерева."},
            {"name": "Шкафы", "slug": "cupboards", "description": "Системы хранения для вашего идеального порядка."},
        ]
        
        categories = {}
        for cat_data in categories_data:
            # Проверяем нет ли уже такой категории
            result = await session.execute(select(Category).where(Category.slug == cat_data["slug"]))
            existing = result.scalar_one_or_none()
            if not existing:
                cat = Category(**cat_data)
                session.add(cat)
                categories[cat_data["slug"]] = cat
                logger.info(f"  + Категория: {cat_data['name']}")
            else:
                categories[cat_data["slug"]] = existing

        await session.flush() 

        # 2. Создаем товары
        promo_end = datetime.now() + timedelta(days=3)
        
        products_data = [
            # Стулья
            {
                "name": "Стул 'Осло' из дуба", 
                "slug": "oslo-oak-chair", 
                "new_price": 12500, 
                "old_price": 15000,
                "material": "oak", 
                "color": "natural", 
                "category_id": categories["chairs"].id,
                "is_active": True,
                "show_timer": True,
                "promo_end": promo_end
            },
            {
                "name": "Кресло 'Версаль' изумруд", 
                "slug": "versal-emerald-chair", 
                "new_price": 24000, 
                "material": "velvet", 
                "color": "emerald", 
                "category_id": categories["chairs"].id,
                "is_active": True
            },
            
            # Диваны
            {
                "name": "Диван 'Честерфилд' классик", 
                "slug": "chesterfield-sofa", 
                "new_price": 85000, 
                "old_price": 105000,
                "material": "leather", 
                "color": "brown", 
                "category_id": categories["sofas"].id,
                "is_active": True,
                "is_bestseller": True
            },
            
            # Столы
            {
                "name": "Обеденный стол 'Carrara'", 
                "slug": "carrara-table", 
                "new_price": 55000, 
                "old_price": 75000,
                "material": "marble", 
                "color": "white", 
                "category_id": categories["tables"].id,
                "is_active": True,
                "show_timer": True,
                "promo_end": promo_end + timedelta(days=2)
            },
        ]
        
        for prod_data in products_data:
            result = await session.execute(select(Product).where(Product.slug == prod_data["slug"]))
            existing = result.scalar_one_or_none()
            if not existing:
                prod = Product(**prod_data)
                session.add(prod)
                logger.info(f"  + Товар: {prod_data['name']}")
            else:
                # Обновляем цены в существующих
                existing.new_price = prod_data["new_price"]
                existing.old_price = prod_data.get("old_price", 0)
                logger.info(f"  ~ Обновлен: {prod_data['name']}")
        
        await session.commit()
        logger.success("✅ База данных успешно наполнена тестовыми данными!")

if __name__ == "__main__":
    asyncio.run(seed_data())
