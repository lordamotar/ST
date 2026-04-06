import asyncio
from sqlalchemy import text
from app.core.database import engine

async def migrate():
    columns = [
        "dimensions VARCHAR(200)",
        "legs_material VARCHAR(100)",
        "tabletop_material VARCHAR(100)",
        "tabletop_thickness VARCHAR(50)",
        "floor_clearance VARCHAR(50)",
        "max_load VARCHAR(50)",
        "legs_adjustment VARCHAR(50)",
        "tabletop_color VARCHAR(100)",
        "footings VARCHAR(100)",
        "warranty VARCHAR(100)",
        "delivery_format VARCHAR(100)",
        "supports VARCHAR(100)",
        "country VARCHAR(100)",
        "series VARCHAR(100)",
    ]
    async with engine.begin() as conn:
        for col_def in columns:
            col_name = col_def.split()[0]
            try:
                # В PostgreSQL ALTER TABLE ADD COLUMN IF NOT EXISTS работает начиная с 9.6
                await conn.execute(text(f"ALTER TABLE products ADD COLUMN IF NOT EXISTS {col_def}"))
                print(f"✅ Успешно обработана колонка: {col_name}")
            except Exception as e:
                print(f"❌ Ошибка с колонкой {col_name}: {e}")

if __name__ == "__main__":
    asyncio.run(migrate())
