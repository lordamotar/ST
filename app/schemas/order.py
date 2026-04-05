from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class OrderCreate(BaseModel):
    customer_name: str
    customer_phone: str
    product_id: int
    message: Optional[str] = None

class OrderResponse(OrderCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
