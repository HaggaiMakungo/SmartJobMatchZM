"""
Seed Test Users
Adds Mark Ziligone (personal employer) and Brian Mwale (job seeker) for testing
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

print("=" * 80)
print("SEEDING TEST USERS")
print("=" * 80)

# Test user credentials
TEST_USERS = [
    {
        "email": "mark.ziligone@example.com",
        "password": "test123",  # Simple password for testing
        "full_name": "Mark Ziligone",
        "role": "employer_personal",
        "description": "Personal employer (posts small jobs)"
    },
    {
        "email": "brian.mwale@example.com",
        "password": "test123",  # Simple password for testing
        "full_name": "Brian Mwale",
        "role": "candidate",
        "description": "Job seeker"
    }
]

def seed_test_users():
    """Add test users to database"""
    session = SessionLocal()
    
    try:
        print("\nAdding test users...")
        
        for user_data in TEST_USERS:
            # Check if user already exists
            existing_user = session.query(User).filter(
                User.email == user_data["email"]
            ).first()
            
            if existing_user:
                print(f"  ⚠️  User already exists: {user_data['full_name']} ({user_data['email']})")
                continue
            
            # Create new user
            new_user = User(
                email=user_data["email"],
                hashed_password=get_password_hash(user_data["password"]),
                full_name=user_data["full_name"],
                is_active=True,
                is_superuser=False
            )
            
            session.add(new_user)
            session.commit()
            
            print(f"  ✅ Added: {user_data['full_name']} ({user_data['email']})")
            print(f"     Role: {user_data['role']}")
            print(f"     Password: {user_data['password']}")
        
        print("\n" + "=" * 80)
        print("✅ TEST USERS SEEDED SUCCESSFULLY")
        print("=" * 80)
        
        print("\n📱 Login Credentials:")
        print("\n1. Mark Ziligone (Personal Employer - Small Jobs)")
        print("   Email: mark.ziligone@example.com")
        print("   Password: test123")
        
        print("\n2. Brian Mwale (Job Seeker)")
        print("   Email: brian.mwale@example.com")
        print("   Password: test123")
        
        print("\n💡 Use these credentials in your mobile app!")
        
    except Exception as e:
        session.rollback()
        print(f"\n❌ Error seeding users: {e}")
        sys.exit(1)
    finally:
        session.close()

if __name__ == "__main__":
    seed_test_users()
