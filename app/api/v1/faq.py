from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from app.core.database import get_db
from app.models.faq import FAQ
from pydantic import BaseModel
from typing import List, Optional
from app.api.v1.auth import get_current_user
from app.models.user import User

router = APIRouter()

class FAQSchema(BaseModel):
    question: str
    answer: str
    is_active: bool = True
    order: int = 0

class FAQResponse(FAQSchema):
    id: int

    class Config:
        from_attributes = True

@router.get("", response_model=List[FAQResponse])
async def get_faqs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FAQ).order_by(FAQ.order.asc()))
    return result.scalars().all()

@router.post("", response_model=FAQResponse)
async def create_faq(
    faq_data: FAQSchema, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    new_faq = FAQ(**faq_data.dict())
    db.add(new_faq)
    await db.commit()
    await db.refresh(new_faq)
    return new_faq

@router.put("/{faq_id}", response_model=FAQResponse)
async def update_faq(
    faq_id: int, 
    faq_data: FAQSchema, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    stmt = update(FAQ).where(FAQ.id == faq_id).values(**faq_data.dict())
    await db.execute(stmt)
    await db.commit()
    
    result = await db.execute(select(FAQ).where(FAQ.id == faq_id))
    faq = result.scalar_one_or_none()
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ not found")
    return faq

@router.delete("/{faq_id}")
async def delete_faq(
    faq_id: int, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    await db.execute(delete(FAQ).where(FAQ.id == faq_id))
    await db.commit()
    return {"status": "deleted"}
