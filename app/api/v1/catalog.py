from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional

from app.core.database import get_db
from app.models.product import Product, Category
from app.schemas.product import ProductResponse, CategoryResponse

router = APIRouter()

@router.get("/categories", response_model=List[CategoryResponse])
async def get_categories(db: AsyncSession = Depends(get_db)):
    """Все категории мебели."""
    result = await db.execute(select(Category))
    return result.scalars().all()

@router.get("/products", response_model=List[ProductResponse])
async def get_products(
    category_slug: Optional[str] = None,
    material: Optional[str] = None,
    color: Optional[str] = None,
    slug: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Каталог товаров с фильтрацией. 
    Используется для SEO-страниц типа /material/oak или /color/red.
    """
    query = select(Product).join(Category)
    
    if category_slug:
        query = query.where(Category.slug == category_slug)
    if material:
        query = query.where(Product.material == material)
    if color:
        query = query.where(Product.color == color)
    if slug:
        query = query.where(Product.slug == slug)
        
    result = await db.execute(query)
    return result.scalars().all()
