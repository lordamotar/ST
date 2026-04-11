from sqlalchemy import Column, Integer, String, Boolean, Text
from app.core.database import Base

class FAQ(Base):
    __tablename__ = "faqs"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(String(255), nullable=False)
    answer = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)
    order = Column(Integer, default=0)
