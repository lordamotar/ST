from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List
from app.core.database import get_db
from app.models.slider import Slide
from app.schemas.slider import SlideCreate, SlideUpdate, SlideResponse
from app.api.v1.auth import require_roles
from app.models.user import User
from datetime import datetime

router = APIRouter()

@router.get("", response_model=List[SlideResponse])
async def get_slides(db: AsyncSession = Depends(get_db)):
    """Получить список всех активных слайдов."""
    # Для клиентов отдаем только активные и подходящие по датам
    # Для админов в админке будет другой эндпоинт или фильтр
    query = select(Slide).order_by(Slide.order.asc())
    result = await db.execute(query)
    return result.scalars().all()

@router.post("", response_model=SlideResponse, status_code=status.HTTP_201_CREATED)
async def create_slide(
    slide_in: SlideCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_roles(["admin"]))
):
    update_data = slide_in.model_dump()
    # Обработка таймзон для PostgreSQL
    for field in ["start_date", "end_date"]:
        if update_data.get(field) and update_data[field].tzinfo:
            update_data[field] = update_data[field].replace(tzinfo=None)
            
    db_slide = Slide(**update_data)
    db.add(db_slide)
    await db.commit()
    await db.refresh(db_slide)
    return db_slide

@router.patch("/{slide_id}", response_model=SlideResponse)
async def update_slide(
    slide_id: int,
    slide_in: SlideUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_roles(["admin"]))
):
    result = await db.execute(select(Slide).where(Slide.id == slide_id))
    db_slide = result.scalar_one_or_none()
    if not db_slide:
        raise HTTPException(status_code=404, detail="Slide not found")
    
    update_data = slide_in.model_dump(exclude_unset=True)
    # Обработка таймзон для PostgreSQL
    for field in ["start_date", "end_date"]:
        if update_data.get(field) and update_data[field].tzinfo:
            update_data[field] = update_data[field].replace(tzinfo=None)
            
    for field, value in update_data.items():
        setattr(db_slide, field, value)
    
    await db.commit()
    await db.refresh(db_slide)
    return db_slide

@router.delete("/{slide_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_slide(
    slide_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_roles(["admin"]))
):
    result = await db.execute(select(Slide).where(Slide.id == slide_id))
    db_slide = result.scalar_one_or_none()
    if not db_slide:
        raise HTTPException(status_code=404, detail="Slide not found")
    
    await db.delete(db_slide)
    await db.commit()
