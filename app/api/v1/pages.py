from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from app.core.database import get_db
from app.models.page import StaticPage
from pydantic import BaseModel
from typing import List, Optional
from app.api.v1.auth import get_current_user
from app.models.user import User

router = APIRouter()

class PageSchema(BaseModel):
    slug: str
    title: str
    content: str

class PageResponse(PageSchema):
    id: int

    class Config:
        from_attributes = True

@router.get("/", response_model=List[PageResponse])
async def get_all_pages(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(StaticPage))
    return result.scalars().all()

@router.get("/{slug}", response_model=PageResponse)
async def get_page_by_slug(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(StaticPage).where(StaticPage.slug == slug))
    page = result.scalar_one_or_none()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return page

@router.post("/", response_model=PageResponse)
async def create_or_update_page(
    page_data: PageSchema, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Check if exists to update
    result = await db.execute(select(StaticPage).where(StaticPage.slug == page_data.slug))
    existing = result.scalar_one_or_none()
    
    if existing:
        stmt = update(StaticPage).where(StaticPage.slug == page_data.slug).values(**page_data.dict())
        await db.execute(stmt)
    else:
        new_page = StaticPage(**page_data.dict())
        db.add(new_page)
    
    await db.commit()
    
    result = await db.execute(select(StaticPage).where(StaticPage.slug == page_data.slug))
    return result.scalar_one()

@router.delete("/{slug}")
async def delete_page(
    slug: str, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    await db.execute(delete(StaticPage).where(StaticPage.slug == slug))
    await db.commit()
    return {"status": "deleted"}
