from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.core.database import get_db
from app.models.settings import SiteSettings
from app.models.user import User
from app.schemas.settings import SettingResponse, SettingUpdate
from app.core.dependencies import require_roles
from loguru import logger

router = APIRouter()

@router.get("/", response_model=List[SettingResponse])
async def get_all_settings(db: AsyncSession = Depends(get_db)):
    """Получить все публичные настройки сайта."""
    result = await db.execute(select(SiteSettings))
    return result.scalars().all()

@router.get("/{key}", response_model=SettingResponse)
async def get_setting(key: str, db: AsyncSession = Depends(get_db)):
    """Получить конкретную настройку по ключу (например, 'whatsapp_number')."""
    result = await db.execute(select(SiteSettings).where(SiteSettings.key == key))
    setting = result.scalar_one_or_none()
    if not setting:
        logger.info(f"Setting {key} not found, using fallback")
        # Если настройки нет, создаем пустышку по умолчанию или кидаем 404
        if key == "whatsapp_number":
             return SettingResponse(id=0, key="whatsapp_number", value="77770000000")
        raise HTTPException(status_code=404, detail="Setting not found")
    
    logger.info(f"Setting fetched: {key}='{setting.value}'")
    return setting

@router.patch("/{key}", response_model=SettingResponse)
async def update_setting(
    key: str,
    setting_in: SettingUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_roles(["admin", "manager"]))
):
    """Обновить настройку (только для админа/менеджера)."""
    result = await db.execute(select(SiteSettings).where(SiteSettings.key == key))
    setting = result.scalar_one_or_none()
    
    if not setting:
        # Создаем если не существует
        setting = SiteSettings(key=key, value=setting_in.value)
        db.add(setting)
    else:
        old_val = setting.value
        setting.value = setting_in.value
        logger.info(f"Setting updated: {key}='{setting_in.value}' (was '{old_val}') by admin")
        
    await db.commit()
    await db.refresh(setting)
    return setting
