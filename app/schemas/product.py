from pydantic import BaseModel, ConfigDict
from typing import Optional, List

class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None

class CategoryResponse(CategoryBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class ProductBase(BaseModel):
    name: str
    slug: str
    price: float
    description: Optional[str] = None
    material: Optional[str] = None
    color: Optional[str] = None
    category_id: int

class ProductResponse(ProductBase):
    id: int
    category: Optional[CategoryResponse] = None
    model_config = ConfigDict(from_attributes=True)
