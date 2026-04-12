from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate, UserResetPassword, UserCreate
from app.core.dependencies import check_admin
from app.core.security import get_password_hash
from loguru import logger

router = APIRouter()

@router.get("", response_model=List[UserResponse])
async def list_users(
    db: AsyncSession = Depends(get_db), 
    admin: User = Depends(check_admin)
):
    """ Список всех пользователей (только для админа) """
    result = await db.execute(select(User).order_by(User.id))
    return result.scalars().all()

@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_in: UserCreate, 
    db: AsyncSession = Depends(get_db), 
    admin: User = Depends(check_admin)
):
    """ Создание нового пользователя админом """
    # Нормализация телефона
    phone_digits = "".join(filter(str.isdigit, user_in.phone))
    if phone_digits.startswith("8"):
         phone_digits = "7" + phone_digits[1:]

    # Проверка существования
    result = await db.execute(select(User).where(
        (User.username == user_in.username) | (User.phone == phone_digits)
    ))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=400, 
            detail="Пользователь с таким логином или телефоном уже существует"
        )
        
    db_user = User(
        username=user_in.username,
        phone=phone_digits,
        email=user_in.email,
        full_name=user_in.full_name,
        role=user_in.role,
        hashed_password=get_password_hash(user_in.password),
        is_active=True
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    
    logger.info(f"User created: {db_user.username} by admin {admin.username}")
    return db_user

@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int, 
    user_in: UserUpdate, 
    db: AsyncSession = Depends(get_db), 
    admin: User = Depends(check_admin)
):
    """ Обновление данных пользователя (только для админа) """
    result = await db.execute(select(User).where(User.id == user_id))
    db_user = result.scalar_one_or_none()
    
    if not db_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    update_data = user_in.model_dump(exclude_unset=True)
    if "password" in update_data:
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
        
    for key, value in update_data.items():
        setattr(db_user, key, value)
        
    await db.commit()
    await db.refresh(db_user)
    
    logger.info(f"User updated: {db_user.username} by admin {admin.username}")
    return db_user

@router.post("/{user_id}/reset-password", response_model=UserResponse)
async def reset_password(
    user_id: int, 
    reset_data: UserResetPassword, 
    db: AsyncSession = Depends(get_db), 
    admin: User = Depends(check_admin)
):
    """ Сброс пароля (только для админа) """
    result = await db.execute(select(User).where(User.id == user_id))
    db_user = result.scalar_one_or_none()
    
    if not db_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    db_user.hashed_password = get_password_hash(reset_data.new_password)
    await db.commit()
    
    logger.info(f"Password reset for user: {db_user.username} by admin {admin.username}")
    return db_user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int, 
    db: AsyncSession = Depends(get_db), 
    admin: User = Depends(check_admin)
):
    """ Удаление пользователя (только для админа) """
    result = await db.execute(select(User).where(User.id == user_id))
    db_user = result.scalar_one_or_none()
    
    if not db_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
        
    await db.delete(db_user)
    await db.commit()
    
    logger.info(f"User deleted: {db_user.username} by admin {admin.username}")
    return None
