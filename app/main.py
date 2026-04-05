import asyncio
from fastapi import FastAPI
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.users import router as users_router
from app.api.v1.catalog import router as catalog_router

# --- Контекст жизненного цикла (Lifespan) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Автоматическое создание таблиц
    async with engine.begin() as conn:
        print("Initializing Furniture Database...")
        # Импортируем модели здесь
        from app.models.product import Category, Product 
        from app.models.user import User 
        await conn.run_sync(Base.metadata.create_all)
    
    print(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}...")
    yield
    print("Shutting down...")

# --- Инициализация FastAPI ---
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

@app.get("/")
async def root():
    return {
        "status": "online",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs"
    }

# Добавление роутеров API
app.include_router(users_router, prefix="/api/v1")
app.include_router(catalog_router, prefix="/api/v1")
