from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    username: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: str = "client"

class UserCreate(UserBase):
    username: str
    phone: str
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

class UserResetPassword(BaseModel):
    new_password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    telegram_id: Optional[int] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class LoginRequest(BaseModel):
    login: str  # Это может быть или username, или phone
    password: str
