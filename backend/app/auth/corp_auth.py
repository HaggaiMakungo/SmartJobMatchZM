"""
Corporate Authentication - Separate from job seeker auth
"""
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from app.models.corp_user import CorpUser
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def authenticate_corp_user(db: Session, email: str, password: str) -> Optional[CorpUser]:
    """
    Authenticate a corporate user
    Returns CorpUser if successful, None if failed
    """
    corp_user = db.query(CorpUser).filter(CorpUser.email == email).first()
    
    if not corp_user:
        return None
    
    if not verify_password(password, corp_user.hashed_password):
        return None
    
    if not corp_user.is_active:
        return None
    
    return corp_user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    return encoded_jwt

def get_corp_user_from_token(token: str, db: Session) -> Optional[CorpUser]:
    """
    Get corporate user from JWT token
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        
        if email is None:
            return None
        
        corp_user = db.query(CorpUser).filter(CorpUser.email == email).first()
        return corp_user
        
    except JWTError:
        return None
