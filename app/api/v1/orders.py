from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
from typing import List
from app.core.database import get_db
from app.models.order import Order
from app.schemas.order import OrderCreate, OrderResponse, OrderUpdateStatus
from app.core.config import settings

router = APIRouter()

@router.post("/", response_model=OrderResponse)
async def create_order(order_in: OrderCreate, db: AsyncSession = Depends(get_db)):
    db_order = Order(
        customer_name=order_in.customer_name,
        customer_phone=order_in.customer_phone,
        product_id=order_in.product_id,
        message=order_in.message,
        status="new"
    )
    db.add(db_order)
    await db.commit()
    await db.refresh(db_order)
    return db_order

@router.get("/", response_model=List[OrderResponse])
async def list_orders(
    admin_token: str = Header(None), 
    db: AsyncSession = Depends(get_db)
):
    if admin_token != settings.JWT_SECRET:
        raise HTTPException(status_code=403, detail="Forbidden: Invalid Admin Token")
        
    result = await db.execute(select(Order).order_by(Order.created_at.desc()))
    return result.scalars().all()

@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: int,
    status_update: OrderUpdateStatus,
    admin_token: str = Header(None),
    db: AsyncSession = Depends(get_db)
):
    if admin_token != settings.JWT_SECRET:
        raise HTTPException(status_code=403, detail="Forbidden: Invalid Admin Token")
    
    # 1. Поиск заказа
    result = await db.execute(select(Order).where(Order.id == order_id))
    db_order = result.scalar_one_or_none()
    
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # 2. Обновление статуса
    db_order.status = status_update.status
    await db.commit()
    await db.refresh(db_order)
    
    return db_order
