from pydantic import BaseModel, ConfigDict
from typing import Optional, List


class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    is_active: bool = True


class CategoryResponse(CategoryBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class ProductBase(BaseModel):
    name: str
    slug: str
    new_price: float
    old_price: Optional[float] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    material: Optional[str] = None
    color: Optional[str] = None
    category_id: int
    availability_status: Optional[str] = "in_stock"

    dimensions: Optional[str] = None
    legs_material: Optional[str] = None
    tabletop_material: Optional[str] = None
    tabletop_thickness: Optional[str] = None
    floor_clearance: Optional[str] = None
    max_load: Optional[str] = None
    legs_adjustment: Optional[str] = None
    tabletop_color: Optional[str] = None
    footings: Optional[str] = None
    warranty: Optional[str] = None
    delivery_format: Optional[str] = None
    supports: Optional[str] = None
    country: Optional[str] = None
    series: Optional[str] = None
    characteristics: Optional[dict] = None


class ProductCreate(ProductBase):
    is_active: bool = True


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    new_price: Optional[float] = None
    old_price: Optional[float] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    material: Optional[str] = None
    color: Optional[str] = None
    category_id: Optional[int] = None
    is_active: Optional[bool] = None
    availability_status: Optional[str] = None

    dimensions: Optional[str] = None
    legs_material: Optional[str] = None
    tabletop_material: Optional[str] = None
    tabletop_thickness: Optional[str] = None
    floor_clearance: Optional[str] = None
    max_load: Optional[str] = None
    legs_adjustment: Optional[str] = None
    tabletop_color: Optional[str] = None
    footings: Optional[str] = None
    warranty: Optional[str] = None
    delivery_format: Optional[str] = None
    supports: Optional[str] = None
    country: Optional[str] = None
    series: Optional[str] = None
    characteristics: Optional[dict] = None


class ProductResponse(ProductBase):
    id: int
    is_active: bool = True
    category: Optional[CategoryResponse] = None
    model_config = ConfigDict(from_attributes=True)


# --- Bulk Import schemas ---

class BulkImportError(BaseModel):
    row: int
    error: str


class BulkImportResponse(BaseModel):
    created: int
    skipped: int
    errors: List[BulkImportError]
