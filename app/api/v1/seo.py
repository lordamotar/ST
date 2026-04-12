from fastapi import APIRouter, Response, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.product import Category, Product
from app.models.page import StaticPage
from datetime import datetime

router = APIRouter()

BASE_URL = "http://localhost:3000" # Замените на реальный домен в продакшене

@router.get("", response_class=Response)
async def get_sitemap(db: AsyncSession = Depends(get_db)):
    urls = []
    
    # Главная
    urls.append({"loc": f"{BASE_URL}/", "lastmod": datetime.now().strftime("%Y-%m-%d"), "priority": "1.0"})
    
    # Категории
    categories = await db.execute(select(Category.slug))
    for cat in categories.scalars():
        urls.append({"loc": f"{BASE_URL}/catalog/{cat}", "lastmod": datetime.now().strftime("%Y-%m-%d"), "priority": "0.8"})
    
    # Товары
    products = await db.execute(select(Product.slug, Product.updated_at))
    for slug, updated_at in products:
        lastmod = updated_at.strftime("%Y-%m-%d") if updated_at else datetime.now().strftime("%Y-%m-%d")
        urls.append({"loc": f"{BASE_URL}/product/{slug}", "lastmod": lastmod, "priority": "0.7"})
        
    # Статические страницы
    pages = await db.execute(select(StaticPage.slug, StaticPage.updated_at))
    for slug, updated_at in pages:
        if slug == "404": continue
        lastmod = updated_at.strftime("%Y-%m-%d") if updated_at else datetime.now().strftime("%Y-%m-%d")
        urls.append({"loc": f"{BASE_URL}/{slug}", "lastmod": lastmod, "priority": "0.5"})

    xml_content = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml_content += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    for url in urls:
        xml_content += f'  <url>\n    <loc>{url["loc"]}</loc>\n    <lastmod>{url["lastmod"]}</lastmod>\n    <priority>{url["priority"]}</priority>\n  </url>\n'
    
    xml_content += '</urlset>'
    
    return Response(content=xml_content, media_type="application/xml")
