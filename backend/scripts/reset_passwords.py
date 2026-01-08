"""
Reset user passwords in the database
Run: python reset_passwords.py
"""
import sys
import os

# Add backend to path
backend_path = os.path.join(os.path.dirname(__file__), '..')
sys.path.insert(0, backend_path)

from sqlalchemy import create_engine, text
from passlib.context import CryptContext

# Database connection
DATABASE_URL = "postgresql://postgres:Winter123@localhost:5432/job_match_db"
engine = create_engine(DATABASE_URL)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def reset_user_passwords():
    """Reset passwords for jobseeker users"""
    
    # Users to reset
    users = [
        ("brian.mwale@example.com", "password123"),
        ("mark.ziligone@example.com", "password123"),
    ]
    
    print("🔑 Resetting user passwords...")
    print()
    
    with engine.connect() as conn:
        for email, password in users:
            hashed_password = hash_password(password)
            
            # Update password
            result = conn.execute(
                text("""
                    UPDATE jobseekers 
                    SET hashed_password = :password 
                    WHERE email = :email
                """),
                {"password": hashed_password, "email": email}
            )
            
            conn.commit()
            
            if result.rowcount > 0:
                print(f"✅ Reset password for {email}")
            else:
                print(f"❌ User not found: {email}")
                # Try to find the user
                check = conn.execute(
                    text("SELECT email FROM jobseekers WHERE email LIKE :pattern"),
                    {"pattern": f"%{email.split('@')[0]}%"}
                )
                found = check.fetchall()
                if found:
                    print(f"   Found similar: {[r[0] for r in found]}")
    
    print()
    print("✅ Done!")

if __name__ == "__main__":
    reset_user_passwords()