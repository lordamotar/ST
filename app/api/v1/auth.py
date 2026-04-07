from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from datetime import timedelta
from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, Token, LoginRequest
from app.core.security import verify_password, get_password_hash, create_access_token
from loguru import logger

router = APIRouter()

@router.post("/login", response_model=Token)
async def login(login_data: LoginRequest, db: AsyncSession = Depends(get_db)):
    # Попытка найти по username напрямую
    result = await db.execute(select(User).where(User.username == login_data.login))
    user = result.scalar_one_or_none()
    
    # Если не нашли по username, пробуем нормализовать как телефон
    if not user:
        # Очищаем ввод от всего, кроме цифр
        phone_digits = "".join(filter(str.isdigit, login_data.login))
        # Если в начале 8, меняем на 7 (стандарт в РК)
        if phone_digits.startswith("8"):
            phone_digits = "7" + phone_digits[1:]
            
        if phone_digits:
            # Ищем по нормализованному телефону в базе
            # Для этого в базе телефоны тоже должны храниться нормализованно
            result = await db.execute(select(User).where(User.phone == phone_digits))
            user = result.scalar_one_or_none()
    
    if not user or not verify_password(login_data.password, user.hashed_password):
        logger.warning(f"Failed login attempt for user: {login_data.login}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный логин (телефон) или пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=60*24) # 1 день
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role}, 
        expires_delta=access_token_expires
    )
    
    logger.info(f"User logged in: {user.username} (Role: {user.role})")
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=UserResponse)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    # Нормализация данных
    phone_digits = "".join(filter(str.isdigit, user_in.phone))
    if phone_digits.startswith("8"):
        phone_digits = "7" + phone_digits[1:]
    
    # Проверка на существование
    result = await db.execute(select(User).where(or_(User.username == user_in.username, User.phone == phone_digits)))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Пользователь с таким логином или телефоном уже существует")
    
    db_user = User(
        username=user_in.username,
        phone=phone_digits,
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=get_password_hash(user_in.password),
        role="client"
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    
    logger.info(f"New user registered: {db_user.username}")
    return db_user
