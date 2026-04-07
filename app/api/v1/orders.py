from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
from typing import List
from app.core.database import get_db
from app.models.order import Order
from app.schemas.order import OrderCreate, OrderResponse, OrderUpdateStatus
from app.core.config import settings
from loguru import logger

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
    
    # Подгружаем заказ с товаром для корректного ответа (избегаем MissingGreenlet)
    result = await db.execute(
        select(Order).options(selectinload(Order.product)).where(Order.id == db_order.id)
    )
    db_order = result.scalar_one()
    
    logger.info(f"New order created: ID={db_order.id}, Customer={db_order.customer_name}, Phone={db_order.customer_phone}")
    return db_order

@router.get("/", response_model=List[OrderResponse])
async def list_orders(
    admin_token: str = Header(None), 
    db: AsyncSession = Depends(get_db)
):
    if admin_token != settings.JWT_SECRET:
        logger.warning("Failed admin access attempt to list orders")
        raise HTTPException(status_code=403, detail="Forbidden: Invalid Admin Token")
    result = await db.execute(select(Order).options(selectinload(Order.product)).order_by(Order.created_at.desc()))
    return result.scalars().all()

@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: int,
    status_update: OrderUpdateStatus,
    admin_token: str = Header(None),
    db: AsyncSession = Depends(get_db)
):
    if admin_token != settings.JWT_SECRET:
        logger.warning(f"Failed admin access attempt to update status for order {order_id}")
        raise HTTPException(status_code=403, detail="Forbidden: Invalid Admin Token")
    
    # 1. Поиск заказа
    result = await db.execute(select(Order).options(selectinload(Order.product)).where(Order.id == order_id))
    db_order = result.scalar_one_or_none()
    
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # 2. Обновление статуса
    old_status = db_order.status
    if db_order.status == "new" and status_update.status != "new":
        db_order.processed_by = "Admin"
    
    db_order.status = status_update.status
    db_order.modified_by = "Admin"
    
    await db.commit()
    await db.refresh(db_order)
    logger.info(f"Order {order_id} status changed: {old_status} -> {db_order.status} (by Admin)")
    
    return db_order
