import asyncio
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.users import router as users_router
from app.api.v1.catalog import router as catalog_router
from app.api.v1.orders import router as orders_router

from loguru import logger
import sys

# Настройка логгера
logger.remove()
logger.add(sys.stderr, format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level:7}</level> | <cyan>{message}</cyan>", level="INFO")
logger.add("logs/app.log", rotation="10 MB", retention="10 days", compression="zip", level="DEBUG")

# --- Директория для загрузок ---
UPLOAD_DIR = Path("uploads/products")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# --- Контекст жизненного цикла (Lifespan) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Автоматическое создание таблиц
    async with engine.begin() as conn:
        logger.info("Initializing Furniture Database...")
        from app.models.product import Category, Product 
        from app.models.user import User 
        from app.models.order import Order
        await conn.run_sync(Base.metadata.create_all)
    
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}...")
    yield
    logger.info("Shutting down...")

# --- Инициализация FastAPI ---
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

# --- Настройка CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Раздача загруженных файлов ---
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

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
app.include_router(catalog_router, prefix="/api/v1/catalog", tags=["catalog"])
app.include_router(orders_router, prefix="/api/v1/orders", tags=["orders"])

