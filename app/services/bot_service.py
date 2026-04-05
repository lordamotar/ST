from aiogram import types
from app.core.database import async_session_maker
from app.repositories.user import UserRepository
from app.schemas.user import UserCreate

async def handle_start(message: types.Message):
    async with async_session_maker() as session:
        repo = UserRepository(session)
        user = await repo.get_by_telegram_id(message.from_user.id)
        
        if not user:
            new_user = UserCreate(
                telegram_id=message.from_user.id,
                username=message.from_user.username,
                full_name=message.from_user.full_name
            )
            await repo.create(new_user)
            await message.answer(f"Привет, {message.from_user.full_name}! Ты успешно зарегистрирован.")
        else:
            await message.answer(f"С возвращением, {user.full_name}!")
