from typing import List, Union
from pydantic_settings import BaseSettings
from pydantic import PostgresDsn, field_validator


class Settings(BaseSettings):
    # Project Info
    PROJECT_NAME: str = "SmartJobMatchZM API"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api"
    
    # CORS - Allow all origins in development (frontend on various ports)
    CORS_ORIGINS: Union[List[str], str] = ["*"]  # Allow all origins in development
    
    @field_validator('CORS_ORIGINS', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',')]
        return v
    
    # Database (reads from .env)
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/job_match_db"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # ML/AI Settings
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    SIMILARITY_THRESHOLD: float = 0.3
    
    # CAMSS Weights (default for white collar)
    WEIGHT_QUALIFICATION: float = 0.25
    WEIGHT_EXPERIENCE: float = 0.25
    WEIGHT_SKILLS: float = 0.30
    WEIGHT_LOCATION: float = 0.20
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
