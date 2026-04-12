import asyncio
import os
import sys
from datetime import datetime

# Добавляем путь к проекту (корень ST)
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, ".."))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.core.config import settings
from app.models.catalog import Category, Product
from app.models.content import SliderSlide, FAQ, SiteSetting
from app.models.user import User
from app.core.security import get_password_hash

async def seed_data():
    print("🌱 Начинаем заполнение тестовыми данными...")
    
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # --- 1. КАТЕГОРИИ ---
        categories_data = [
            {"name": "Столы", "slug": "tables", "description": "Дизайнерские столы из массива дерева и камня."},
            {"name": "Стулья", "slug": "chairs", "description": "Эргономичные и стильные стулья для дома и офиса."},
            {"name": "Диваны", "slug": "sofas", "description": "Премиальные диваны с итальянской обивкой."},
            {"name": "Шкафы", "slug": "cupboards", "description": "Системы хранения, сочетающие эстетику и функциональность."}
        ]
        
        categories = {}
        for cat_data in categories_data:
            result = await session.execute(select(Category).where(Category.slug == cat_data["slug"]))
            cat = result.scalar_one_or_none()
            if not cat:
                cat = Category(**cat_data)
                session.add(cat)
                print(f"✅ Категория создана: {cat_data['name']}")
            categories[cat_data["slug"]] = cat

        await session.commit()

        # --- 2. ТОВАРЫ ---
        products_data = [
            # Столы
            {
                "name": "Обеденный стол 'Titanium Oak'",
                "slug": "titanium-oak-table",
                "description": "Массив дуба, ручная обработка, титановое основание.",
                "price": 450000,
                "new_price": 380000,
                "category_id": categories["tables"].id,
                "material": "Дуб",
                "color": "Натуральный",
                "is_active": True,
                "is_bestseller": True,
                "characteristics": {"Форма": "Прямоугольный", "Мест": "8", "Вес": "75кг"}
            },
            {
                "name": "Кофейный столик 'Minimalist Glass'",
                "slug": "minimalist-glass",
                "description": "Закаленное стекло и матовая сталь.",
                "price": 85000,
                "new_price": 85000,
                "category_id": categories["tables"].id,
                "material": "Стекло",
                "color": "Дымчатый",
                "is_active": True,
                "characteristics": {"Диаметр": "60см", "Высота": "45см"}
            },
            # Стулья
            {
                "name": "Кресло 'Velvet Royal'",
                "slug": "velvet-royal-chair",
                "description": "Бархатная обивка изумрудного цвета, золотые ножки.",
                "price": 120000,
                "new_price": 95000,
                "category_id": categories["chairs"].id,
                "material": "Велюр",
                "color": "Изумруд",
                "is_active": True,
                "is_bestseller": True,
                "characteristics": {"Стиль": "Ар-деко", "Нагрузка": "150кг"}
            },
            {
                "name": "Стул 'Nordic Loft'",
                "slug": "nordic-loft",
                "description": "Минимализм в каждой детали. Эко-кожа и металл.",
                "price": 45000,
                "new_price": 39000,
                "category_id": categories["chairs"].id,
                "material": "Эко-кожа",
                "color": "Графит",
                "is_active": True
            },
            # Диваны
            {
                "name": "Диван 'Cloud Comfort'",
                "slug": "cloud-comfort-sofa",
                "description": "Трехместный диван с эффектом памяти.",
                "price": 850000,
                "new_price": 720000,
                "category_id": categories["sofas"].id,
                "material": "Шенилл",
                "color": "Бежевый",
                "is_active": True,
                "is_bestseller": True
            }
        ]

        for p_data in products_data:
            result = await session.execute(select(Product).where(Product.slug == p_data["slug"]))
            if not result.scalar_one_or_none():
                p = Product(**p_data)
                session.add(p)
                print(f"✅ Товар добавлен: {p_data['name']}")

        # --- 3. СЛАЙДЫ ---
        slides_data = [
            {
                "title": "Весенняя коллекция 2026",
                "subtitle": "Обновите интерьер с выгодой до 30%",
                "button_text": "Смотреть каталог",
                "button_link": "/catalog",
                "is_active": True,
                "order": 1
            },
            {
                "title": "Индивидуальный заказ",
                "subtitle": "Создаем мебель по вашим эскизам",
                "button_text": "Обсудить проект",
                "button_link": "/contacts",
                "is_active": True,
                "order": 2
            }
        ]

        for s_data in slides_data:
            result = await session.execute(select(SliderSlide).where(SliderSlide.title == s_data["title"]))
            if not result.scalar_one_or_none():
                s = SliderSlide(**s_data)
                session.add(s)
                print(f"✅ Слайд добавлен: {s_data['title']}")

        # --- 4. НАСТРОЙКИ ---
        settings_data = [
            {"key": "home_hero_badge", "value": "New Collection 2026"},
            {"key": "home_hero_title", "value": "Эстетика Вашего дома"},
            {"key": "home_hero_subtitle", "value": "Премиальная мебель от производителя в Казахстане."},
            {"key": "contact_phone", "value": "+7 (777) 123-4567"},
            {"key": "contact_whatsapp", "value": "77771234567"},
            {"key": "contact_instagram", "value": "st_sklad_mebel"},
            {"key": "address", "value": "г. Семей, ул. Примерная, 15"},
        ]

        for set_data in settings_data:
            result = await session.execute(select(SiteSetting).where(SiteSetting.key == set_data["key"]))
            if not result.scalar_one_or_none():
                s = SiteSetting(**set_data)
                session.add(s)
                print(f"✅ Настройка добавлена: {set_data['key']}")

        await session.commit()
        print("\n✨ Все данные успешно загружены!")

if __name__ == "__main__":
    asyncio.run(seed_data())
