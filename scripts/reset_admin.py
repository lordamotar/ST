import asyncio
import os
import sys

# Добавляем путь к проекту
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, ".."))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.core.config import settings
from app.models.user import User
from app.core.security import get_password_hash

async def reset_admin():
    print("🔄 Сброс пароля администратора...")
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        result = await session.execute(select(User).where(User.username == "admin"))
        admin = result.scalar_one_or_none()
        
        if not admin:
            print("❌ Пользователь 'admin' не найден. Создаю нового...")
            admin = User(
                username="admin",
                phone="77777777777",
                full_name="Administrator",
                hashed_password=get_password_hash("admin"),
                role="admin",
                is_active=True,
                is_admin=True
            )
            session.add(admin)
        else:
            print("👤 Пользователь 'admin' найден. Обновляю пароль...")
            admin.hashed_password = get_password_hash("admin")
            admin.is_active = True
            admin.is_admin = True
        
        await session.commit()
        print("✅ Пароль успешно сброшен на: admin")

if __name__ == "__main__":
    asyncio.run(reset_admin())
