import asyncio
import pytest
import sys
from app.core.database import engine

# 1. Принудительно устанавливаем политику цикла для Windows
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

@pytest.fixture(scope="session")
def event_loop():
    """Создаем единый цикл событий для всей сессии тестов."""
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    yield loop
    loop.close()

@pytest.fixture(autouse=True)
async def cleanup_database():
    """Автоматически сбрасываем соединения базы данных после каждого теста."""
    yield
    # Очищаем пул соединений, чтобы следующий тест не получил 'мертвое' соединение из другого цикла
    await engine.dispose()
