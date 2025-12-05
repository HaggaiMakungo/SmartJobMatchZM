from typing import Generator, Union, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.session import get_db
from app.core.security import decode_access_token
from app.models.user import User
from dataclasses import dataclass

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


@dataclass
class CompanyUser:
    """Represents a company account (recruiter) from corp_users table"""
    id: int
    email: str
    full_name: str
    company_name: str  # Exact company name for DB queries
    company_display_name: str  # Display name for UI
    role: str = "recruiter"


def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> Union[User, CompanyUser]:
    """Get current authenticated user (supports both regular users and company accounts)"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    
    user_id_str: str = payload.get("sub")
    if user_id_str is None:
        raise credentials_exception
    
    # Check if this is a company account from corp_users table
    try:
        user_id = int(user_id_str)
        
        # Try corp_users table first (for recruiters)
        result = db.execute(text("""
            SELECT id, email, company_name, company_display_name, is_active
            FROM corp_users
            WHERE id = :user_id
        """), {"user_id": user_id})
        
        user = result.fetchone()
        
        if user:
            user_id, email, company_name, company_display_name, is_active = user
            
            if not is_active:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Account is inactive"
                )
            
            return CompanyUser(
                id=user_id,
                email=email,
                full_name=company_display_name,
                company_name=company_name,  # For DB queries (exact match)
                company_display_name=company_display_name,  # For UI display
                role="recruiter"
            )
    except ValueError:
        pass
    
    # Fallback to regular user table (for candidates)
    try:
        user_id = int(user_id_str)
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            return user
    except (ValueError, TypeError):
        pass
    
    raise credentials_exception
