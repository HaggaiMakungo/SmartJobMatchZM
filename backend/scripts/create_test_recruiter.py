"""
Create a test recruiter user for development
"""
import sys
from pathlib import Path

# Add the backend directory to the path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash


def create_test_recruiter():
    """Create a test recruiter account"""
    db = SessionLocal()
    
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == "recruiter@zedsafe.com").first()
        
        if existing_user:
            print(f"✅ User already exists!")
            print(f"   Email: {existing_user.email}")
            print(f"   ID: {existing_user.id}")
            print(f"   Full Name: {existing_user.full_name}")
            print(f"\n🔐 Credentials:")
            print(f"   Email: recruiter@zedsafe.com")
            print(f"   Password: test123")
            return
        
        # Create new user
        hashed_password = get_password_hash("test123")
        
        new_user = User(
            email="recruiter@zedsafe.com",
            full_name="ZedSafe Recruiter",
            hashed_password=hashed_password,
            is_active=True
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        print("✅ Test recruiter account created successfully!")
        print(f"   Email: {new_user.email}")
        print(f"   ID: {new_user.id}")
        print(f"   Full Name: {new_user.full_name}")
        print(f"\n🔐 Credentials:")
        print(f"   Email: recruiter@zedsafe.com")
        print(f"   Password: test123")
        print(f"\n🚀 You can now login at: http://localhost:3000/login")
        
    except Exception as e:
        print(f"❌ Error creating user: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    create_test_recruiter()
