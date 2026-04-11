import asyncio
from app.core.database import engine
from sqlalchemy import inspect

async def check_tables():
    async with engine.connect() as conn:
        tables = await conn.run_sync(lambda sync_conn: inspect(sync_conn).get_table_names())
        print(f"Tables in DB: {tables}")
        if "faqs" in tables:
            print("SUCCESS: 'faqs' table exists.")
        else:
            print("ERROR: 'faqs' table NOT found.")

if __name__ == "__main__":
    asyncio.run(check_tables())
