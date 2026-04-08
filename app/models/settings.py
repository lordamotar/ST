from sqlalchemy import Column, Integer, String, Text
from app.core.database import Base

class SiteSettings(Base):
    __tablename__ = "site_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(50), unique=True, index=True)
    value = Column(Text)
