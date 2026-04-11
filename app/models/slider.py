from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from app.core.database import Base
from datetime import datetime

class Slide(Base):
    __tablename__ = "slides"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255))
    description = Column(Text)
    image_url = Column(String(500))
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime)
    show_timer = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    order = Column(Integer, default=0)
