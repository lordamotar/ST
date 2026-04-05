from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class OrderCreate(BaseModel):
    customer_name: str
    customer_phone: str
    product_id: int
    message: Optional[str] = None

class OrderUpdateStatus(BaseModel):
    status: str

class OrderResponse(OrderCreate):
    id: int
    created_at: datetime
    status: str
    model_config = ConfigDict(from_attributes=True)
