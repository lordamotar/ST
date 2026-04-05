from pydantic import BaseModel
from typing import Optional

class UserBase(BaseModel):
    telegram_id: int
    username: Optional[str] = None
    full_name: Optional[str] = None
    is_active: bool = True

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    is_admin: bool
    is_master: bool

    class Config:
        from_attributes = True
