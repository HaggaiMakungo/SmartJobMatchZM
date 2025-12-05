from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.session import get_db
from app.core.security import create_access_token
from app.api.deps import get_current_user
from passlib.context import CryptContext
import logging

# Set up logging
logger = logging.getLogger(__name__)

# Password context for passlib (bcrypt)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a bcrypt hash using passlib"""
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        logger.error(f"Password verification error: {e}")
        return False


@router.post("/auth/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login endpoint for company recruiters - returns JWT token"""
    
    # 🔍 DETAILED LOGGING FOR DEBUGGING
    logger.info("=== LOGIN ATTEMPT ===")
    logger.info(f"Email received: {form_data.username}")
    logger.info(f"Password received: {'***hidden***' if form_data.password else 'MISSING'}")
    
    # Find company user by email in corp_users table
    result = db.execute(text("""
        SELECT id, email, hashed_password, company_name, company_display_name, is_active
        FROM corp_users
        WHERE email = :email
    """), {"email": form_data.username})
    
    user = result.fetchone()
    
    if not user:
        logger.warning(f"❌ User not found with email: {form_data.username}")
        
        # Show sample users for debugging
        sample_users = db.execute(text("""
            SELECT email, company_display_name 
            FROM corp_users 
            WHERE is_active = TRUE 
            LIMIT 10
        """))
        logger.info("Sample corporate users in database:")
        for u in sample_users:
            logger.info(f"  - {u[0]} ({u[1]})")
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id, email, hashed_password, company_name, company_display_name, is_active = user
    logger.info(f"✅ User found: {company_display_name} (ID: {user_id})")
    
    # Check if account is active
    if not is_active:
        logger.warning(f"❌ Account is inactive: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is inactive",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    try:
        password_valid = verify_password(form_data.password, hashed_password)
        logger.info(f"Password verification result: {password_valid}")
    except Exception as e:
        logger.error(f"❌ Password verification error: {e}")
        password_valid = False
    
    if not password_valid:
        logger.warning(f"❌ Invalid password for user: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    logger.info("✅ Password verified successfully")
    
    # Create access token with user data
    access_token = create_access_token(data={
        "sub": str(user_id),
        "email": email,
        "company_name": company_name,  # Exact company name for DB queries
        "company_display_name": company_display_name,  # Display name for UI
        "role": "recruiter"
    })
    
    logger.info(f"✅ Access token created for user: {company_display_name}")
    logger.info("===================")
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "email": email,
            "full_name": company_display_name,
            "company_name": company_name,  # For API queries
            "company_display_name": company_display_name,  # For UI display
            "role": "recruiter",
            "profile_completed": True
        }
    }


@router.get("/auth/me")
def get_current_user_info(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get current company/user information"""
    
    # Get user info from corp_users table
    try:
        result = db.execute(text("""
            SELECT id, email, company_name, company_display_name, is_active
            FROM corp_users
            WHERE id = :user_id
        """), {"user_id": current_user.id if hasattr(current_user, 'id') else current_user})
        
        user = result.fetchone()
        
        if user:
            user_id, email, company_name, company_display_name, is_active = user
            
            if not is_active:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Account is inactive"
                )
            
            # Get job count for this company
            job_count_result = db.execute(text("""
                SELECT COUNT(*) 
                FROM corporate_jobs 
                WHERE company = :company_name
            """), {"company_name": company_name})
            job_count = job_count_result.scalar()
            
            return {
                "id": user_id,
                "email": email,
                "full_name": company_display_name,
                "company_name": company_name,
                "company_display_name": company_display_name,
                "role": "recruiter",
                "profile_completed": True,
                "job_count": job_count
            }
    except Exception as e:
        logger.error(f"Error fetching user info: {e}")
        pass
    
    # If we get here, user not found
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials"
    )


@router.post("/auth/logout")
def logout():
    """Logout endpoint - token invalidation happens on client side"""
    return {
        "message": "Logged out successfully"
    }


@router.post("/auth/register")
def register(db: Session = Depends(get_db)):
    """Register new user - TODO: Implement"""
    return {"message": "Register endpoint - coming soon"}
