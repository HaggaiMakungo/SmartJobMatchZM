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

# Password contexts for both bcrypt (corp_users) and argon2 (users)
bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
argon2_context = CryptContext(schemes=["argon2"], deprecated="auto")

router = APIRouter()


def verify_password_bcrypt(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a bcrypt hash (for corp_users)"""
    try:
        return bcrypt_context.verify(plain_password, hashed_password)
    except Exception as e:
        logger.error(f"Bcrypt verification error: {e}")
        return False


def verify_password_argon2(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against an argon2 hash (for mobile users)"""
    try:
        return argon2_context.verify(plain_password, hashed_password)
    except Exception as e:
        logger.error(f"Argon2 verification error: {e}")
        return False


@router.post("/auth/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Universal login endpoint - works for both:
    1. Corporate recruiters (corp_users table, bcrypt)
    2. Mobile app candidates (users table, argon2)
    """
    
    logger.info("=== LOGIN ATTEMPT ===")
    logger.info(f"Email: {form_data.username}")
    
    # FIRST: Try corporate users (recruiters)
    result = db.execute(text("""
        SELECT id, email, hashed_password, company_name, company_display_name, is_active
        FROM corp_users
        WHERE email = :email
    """), {"email": form_data.username})
    
    corp_user = result.fetchone()
    
    if corp_user:
        user_id, email, hashed_password, company_name, company_display_name, is_active = corp_user
        logger.info(f"✅ Corporate user found: {company_display_name}")
        
        if not is_active:
            logger.warning(f"❌ Corporate account inactive: {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is inactive"
            )
        
        # Verify with bcrypt
        if not verify_password_bcrypt(form_data.password, hashed_password):
            logger.warning(f"❌ Invalid password for corporate user: {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        logger.info("✅ Corporate login successful")
        
        # Create token for recruiter
        access_token = create_access_token(data={
            "sub": str(user_id),
            "email": email,
            "company_name": company_name,
            "company_display_name": company_display_name,
            "role": "recruiter"
        })
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user_id,
                "email": email,
                "full_name": company_display_name,
                "company_name": company_name,
                "company_display_name": company_display_name,
                "role": "recruiter",
                "profile_completed": True
            }
        }
    
    # SECOND: Try mobile/candidate users
    result = db.execute(text("""
        SELECT id, email, hashed_password, full_name, is_active
        FROM users
        WHERE email = :email
    """), {"email": form_data.username})
    
    mobile_user = result.fetchone()
    
    if mobile_user:
        user_id, email, hashed_password, full_name, is_active = mobile_user
        logger.info(f"✅ Mobile user found: {full_name}")
        
        if not is_active:
            logger.warning(f"❌ Mobile account inactive: {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is inactive"
            )
        
        # Verify with argon2
        if not verify_password_argon2(form_data.password, hashed_password):
            logger.warning(f"❌ Invalid password for mobile user: {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        logger.info("✅ Mobile login successful")
        
        # Get CV info if available
        cv_result = db.execute(text("""
            SELECT cv_id FROM cvs WHERE email = :email
        """), {"email": email})
        cv = cv_result.fetchone()
        cv_id = cv[0] if cv else None
        
        # Create token for candidate
        access_token = create_access_token(data={
            "sub": str(user_id),
            "email": email,
            "full_name": full_name,
            "role": "candidate",
            "cv_id": cv_id
        })
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user_id,
                "email": email,
                "full_name": full_name,
                "role": "candidate",
                "cv_id": cv_id,
                "profile_completed": cv_id is not None
            }
        }
    
    # NOT FOUND in either table
    logger.warning(f"❌ User not found: {form_data.username}")
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect email or password"
    )


@router.get("/auth/me")
def get_current_user_info(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get current user information (works for both recruiters and candidates)"""
    
    # Try corporate user first
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
            
            # Get job count
            job_count_result = db.execute(text("""
                SELECT COUNT(*) FROM corporate_jobs WHERE company = :company_name
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
        logger.debug(f"Not a corporate user: {e}")
    
    # Try mobile/candidate user
    try:
        result = db.execute(text("""
            SELECT id, email, full_name, is_active
            FROM users
            WHERE id = :user_id
        """), {"user_id": current_user.id if hasattr(current_user, 'id') else current_user})
        
        user = result.fetchone()
        
        if user:
            user_id, email, full_name, is_active = user
            
            if not is_active:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Account is inactive"
                )
            
            # Get CV info
            cv_result = db.execute(text("""
                SELECT cv_id FROM cvs WHERE email = :email
            """), {"email": email})
            cv = cv_result.fetchone()
            cv_id = cv[0] if cv else None
            
            return {
                "id": user_id,
                "email": email,
                "full_name": full_name,
                "role": "candidate",
                "cv_id": cv_id,
                "profile_completed": cv_id is not None
            }
    except Exception as e:
        logger.error(f"Error fetching candidate info: {e}")
    
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
