from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from datetime import datetime, timedelta

from app.core.database import get_db
from app.models.order import Order
from app.models.product import Product, Category
from app.models.user import User
from app.api.v1.auth import require_roles

router = APIRouter()

@router.get("/dashboard")
async def get_dashboard_stats(
    days: int = 7,
    start_date: str = None,
    end_date: str = None,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_roles(["admin"]))
):
    # 1. KPI Карточки (остаются общими)
    total_orders = await db.scalar(select(func.count(Order.id)))
    new_orders = await db.scalar(select(func.count(Order.id)).where(Order.status == "new"))
    total_products = await db.scalar(select(func.count(Product.id)).where(Product.is_active == True))
    total_users = await db.scalar(select(func.count(User.id)))
    total_clients = await db.scalar(select(func.count(User.id)).where(User.role == "client"))
    
    stmt = select(func.sum(Product.new_price)).join(Order, Order.product_id == Product.id)
    total_revenue = await db.scalar(stmt) or 0

    # 2. График заказов по дням (Динамический диапазон)
    chart_data = []
    
    if start_date and end_date:
        # Парсинг произвольных дат
        try:
            s_date = datetime.strptime(start_date, "%Y-%m-%d").date()
            e_date = datetime.strptime(end_date, "%Y-%m-%d").date()
        except ValueError:
            # Если пришел полный ISO формат
            s_date = datetime.fromisoformat(start_date.replace("Z", "+00:00")).date()
            e_date = datetime.fromisoformat(end_date.replace("Z", "+00:00")).date()
            
        delta = (e_date - s_date).days
        range_days = min(delta + 1, 60) # Ограничим 60 днями для производительности
        current_s_date = s_date
    else:
        # По количеству дней от сегодня
        range_days = days
        current_s_date = (datetime.utcnow() - timedelta(days=range_days - 1)).date()

    for i in range(range_days):
        target_date = current_s_date + timedelta(days=i)
        count = await db.scalar(
            select(func.count(Order.id)).where(func.date(Order.created_at) == target_date)
        )
        chart_data.append({
            "name": target_date.strftime("%d.%m"),
            "orders": count
        })

    # 3. Топ категорий по заказам
    stmt = select(Category.name, func.count(Order.id).label("count"))\
        .join(Product, Product.category_id == Category.id)\
        .join(Order, Order.product_id == Product.id)\
        .group_by(Category.name)\
        .order_by(func.count(Order.id).desc())\
        .limit(5)
    cat_res = await db.execute(stmt)
    top_categories = [{"name": row[0], "value": row[1]} for row in cat_res.all()]

    # 4. Топ товаров по заказам
    stmt = select(Product.name, func.count(Order.id).label("count"))\
        .join(Order, Order.product_id == Product.id)\
        .group_by(Product.name)\
        .order_by(func.count(Order.id).desc())\
        .limit(5)
    prod_res = await db.execute(stmt)
    top_products = [{"name": row[0], "value": row[1]} for row in prod_res.all()]

    # 5. Распределение по статусам
    status_counts = []
    statuses = ["new", "pending", "completed", "cancelled"]
    for status in statuses:
        count = await db.scalar(select(func.count(Order.id)).where(Order.status == status))
        status_counts.append({"name": status, "value": count})

    # 4. Последние 5 заказов
    stmt = select(Order, Product.name.label("product_name"))\
        .join(Product, Order.product_id == Product.id)\
        .order_by(Order.created_at.desc())\
        .limit(5)
    
    recent_result = await db.execute(stmt)
    recent_orders = []
    for row in recent_result.all():
        order = row[0]
        recent_orders.append({
            "id": order.id,
            "product": row.product_name,
            "customer": order.customer_name or order.customer_phone,
            "status": order.status,
            "date": order.created_at.isoformat()
        })

    # 5. Уведомления / Алерты
    out_of_stock = await db.scalar(select(func.count(Product.id)).where(Product.availability_status == "out_of_stock"))

    return {
        "kpi": {
            "total_orders": total_orders,
            "new_orders": new_orders,
            "total_products": total_products,
            "total_users": total_users,
            "total_clients": total_clients,
            "total_revenue": total_revenue
        },
        "charts": {
            "orders_daily": chart_data,
            "status_distribution": status_counts,
            "top_categories": top_categories,
            "top_products": top_products
        },
        "recent_orders": recent_orders,
        "alerts": {
            "new_orders_count": new_orders,
            "out_of_stock_count": out_of_stock
        }
    }
