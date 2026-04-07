from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, Boolean, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, Optional
from app.core.database import Base

class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    products: Mapped[List["Product"]] = relationship(back_populates="category")

class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    slug: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    new_price: Mapped[float] = mapped_column(Float)
    old_price: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"))
    category: Mapped["Category"] = relationship(back_populates="products")

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    availability_status: Mapped[str] = mapped_column(String(50), default="in_stock")
    
    # Изображение товара
    image_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Характеристики (универсальные key-value, например Гарантия, Страна и т.д.)
    characteristics: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True, default=dict)

    # Детальные характеристики (отдельные столбцы)
    dimensions: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    legs_material: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    tabletop_material: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    tabletop_thickness: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    floor_clearance: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    max_load: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    legs_adjustment: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    tabletop_color: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    footings: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    warranty: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    delivery_format: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    supports: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    country: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    series: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Свойства для SEO (материалы, цвета)
    material: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    color: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
