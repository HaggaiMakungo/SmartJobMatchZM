"""
Create a test recruiter user for login testing
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent))

from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

def create_test_user():
    """Create a test recruiter user"""
    db = SessionLocal()
    
    try:
        # Check if user already exists
        existing = db.query(User).filter(User.email == "recruiter@zedsafe.com").first()
        
        if existing:
            print(f"✅ Test user already exists:")
            print(f"   Email: {existing.email}")
            print(f"   ID: {existing.id}")
            print(f"   Name: {existing.full_name}")
            print(f"\n   Use these credentials to log in:")
            print(f"   Email: recruiter@zedsafe.com")
            print(f"   Password: test123")
            return
        
        # Create new test user
        test_user = User(
            email="recruiter@zedsafe.com",
            hashed_password=get_password_hash("test123"),
            full_name="Test Recruiter",
            is_active=True
        )
        
        db.add(test_user)
        db.commit()
        db.refresh(test_user)
        
        print("✅ Test user created successfully!")
        print(f"   Email: {test_user.email}")
        print(f"   ID: {test_user.id}")
        print(f"   Name: {test_user.full_name}")
        print(f"\n   Use these credentials to log in:")
        print(f"   Email: recruiter@zedsafe.com")
        print(f"   Password: test123")
        
    except Exception as e:
        print(f"❌ Error creating test user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("Creating test recruiter user...\n")
    create_test_user()
