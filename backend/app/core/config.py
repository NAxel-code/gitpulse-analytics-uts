from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "GitPulse Analytics"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    
    # Environment & Database
    ENV: str = "development"
    DUCKDB_PATH: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "omnipulse.duckdb")
    
    # PostgreSQL Database Configuration
    POSTGRES_HOST: str = "postgres"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "gitpulse"
    POSTGRES_USER: str = "gitpulse_user"
    POSTGRES_PASSWORD: str = "gitpulse_pass"
    
    # Ingestion Buffer Settings
    BUFFER_FLUSH_INTERVAL_SECONDS: float = 1.0
    BUFFER_BATCH_SIZE: int = 500
    HMAC_SECRET: str = "omnipulse-default-secret-key-change-in-production"
    
    # AI Engine
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-2.5-flash"
    
    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    model_config = SettingsConfigDict(env_file=".env", extra="allow")

settings = Settings()
