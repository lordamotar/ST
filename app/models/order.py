from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String(255), nullable=False)
    customer_phone = Column(String(50), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"))
    message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    status = Column(String(50), default="new", nullable=False)
    processed_by = Column(String(100), nullable=True)
    modified_by = Column(String(100), nullable=True)

    product = relationship("Product")
