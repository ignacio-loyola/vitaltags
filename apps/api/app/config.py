from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # API Configuration
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    SECRET_KEY: str
    JWT_EXP_MIN: int = 60
    
    # Database
    DATABASE_URL: str
    
    # Redis
    REDIS_URL: str
    
    # S3 Storage
    S3_ENDPOINT: str
    S3_ACCESS_KEY: str
    S3_SECRET_KEY: str
    S3_BUCKET: str
    S3_PUBLIC_BASE: str
    
    # URLs
    BASE_URL: str
    PUBLIC_CDN_BASE: str
    
    # Magic Link Email
    MAGICLINK_FROM: str
    MAGICLINK_BASE_URL: str
    
    # Security
    CSP_REPORT_URI: Optional[str] = None
    
    # Environment
    NODE_ENV: str = "development"
    TZ: str = "Europe/Madrid"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()  # type: ignore