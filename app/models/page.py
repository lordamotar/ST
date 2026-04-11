from sqlalchemy import Column, Integer, String, Text, DateTime
from app.core.database import Base
import datetime

class StaticPage(Base):
    __tablename__ = "static_pages"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
