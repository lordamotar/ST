from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class SlideBase(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    show_timer: bool = False
    is_active: bool = True
    order: int = 0

class SlideCreate(SlideBase):
    pass

class SlideUpdate(SlideBase):
    pass

class SlideResponse(SlideBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
