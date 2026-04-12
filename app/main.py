import asyncio
import sys
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import engine, Base, get_db
from app.api.v1.users import router as users_router
from app.api.v1.catalog import router as catalog_router
from app.api.v1.orders import router as orders_router
from app.api.v1.auth import router as auth_router
from app.api.v1.settings import router as settings_router
from app.api.v1.slider import router as slider_router
from app.api.v1.admin import router as admin_router
from app.api.v1.faq import router as faq_router
from app.api.v1.pages import router as pages_router
from app.api.v1.seo import router as seo_router

# Настройка логгера
logger.remove()
logger.add(sys.stderr, format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level:7}</level> | <cyan>{message}</cyan>", level="INFO")
logger.add("logs/app.log", rotation="10 MB", retention="10 days", compression="zip", level="DEBUG")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Автоматическое создание таблиц (Безопасная инициализация)
    try:
        async with engine.begin() as conn:
            logger.info("Initializing Furniture Database...")
            from app.models.product import Category, Product 
            from app.models.user import User 
            from app.models.order import Order
            from app.models.settings import SiteSettings
            from app.models.faq import FAQ
            from app.models.page import StaticPage
            await conn.run_sync(Base.metadata.create_all)
    except Exception as e:
        logger.error(f"⚠️ Database initialization failed: {e}")
    
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}...")
    yield
    logger.info("Shutting down...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Разрешаем все источники для продакшена
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
async def root():
    return {
        "status": "online",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs"
    }

# Регистрация роутеров
app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(users_router, prefix="/api/v1/users", tags=["users"])
app.include_router(catalog_router, prefix="/api/v1/catalog", tags=["catalog"])
app.include_router(orders_router, prefix="/api/v1/orders", tags=["orders"])
app.include_router(settings_router, prefix="/api/v1/settings", tags=["settings"])
app.include_router(slider_router, prefix="/api/v1/slider", tags=["slider"])
app.include_router(admin_router, prefix="/api/v1/admin", tags=["admin"])
app.include_router(faq_router, prefix="/api/v1/faq", tags=["faq"])
app.include_router(pages_router, prefix="/api/v1/pages", tags=["pages"])
app.include_router(seo_router, prefix="/api/v1/seo", tags=["seo"])

@app.get("/sitemap.xml", include_in_schema=False)
async def sitemap_xml(db: AsyncSession = Depends(get_db)):
    from app.api.v1.seo import get_sitemap
    return await get_sitemap(db)
