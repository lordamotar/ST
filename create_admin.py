import asyncio
from app.core.database import async_session_maker
from app.models.user import User
from app.core.security import get_password_hash
from sqlalchemy import select

async def create_superuser():
    async with async_session_maker() as session:
        # Проверяем, есть ли уже такой пользователь
        result = await session.execute(select(User).where(User.username == "admin"))
        if result.scalar_one_or_none():
            print("❌ Администратор уже существует.")
            return

        admin = User(
            username="admin",
            phone="77777777777",
            full_name="Главный Администратор",
            hashed_password=get_password_hash("admin"),
            role="admin",
            is_active=True,
            is_admin=True
        )
        
        session.add(admin)
        await session.commit()
        print("✅ Суперпользователь создан!")
        print("Логин: admin")
        print("Пароль: admin")

if __name__ == "__main__":
    asyncio.run(create_superuser())
