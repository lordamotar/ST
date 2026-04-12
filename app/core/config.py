from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Furniture Store"
    VERSION: str = "1.0.0"
    DEBUG: bool = True

    # База данных
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/st_db"
    
    # Безопасность
    JWT_SECRET: str = "YOUR_SECRET_KEY_HERE"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    BASE_URL: str = "http://localhost:8000"

    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
