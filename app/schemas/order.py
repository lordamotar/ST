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

class ProductNested(BaseModel):
    name: str
    model_config = ConfigDict(from_attributes=True)

class OrderResponse(OrderCreate):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    status: str
    processed_by: Optional[str] = None
    modified_by: Optional[str] = None
    product: Optional[ProductNested] = None
    model_config = ConfigDict(from_attributes=True)
