"""
Create demo users for testing
Mark Ziligone (Recruiter) and Brian Mwale (Job Seeker)
"""
from app.db.session import SessionLocal
from app.models import User
from app.core.security import get_password_hash
from datetime import datetime

session = SessionLocal()

try:
    print("Creating demo users...")
    print("=" * 80)
    
    # Check if users already exist
    existing_mark = session.query(User).filter(User.email == "mark.ziligone@smartjobmatch.zm").first()
    existing_brian = session.query(User).filter(User.email == "brian.mwale@email.com").first()
    
    if existing_mark:
        print("✓ Mark Ziligone already exists")
    else:
        # Create Mark Ziligone (Recruiter)
        mark = User(
            email="mark.ziligone@smartjobmatch.zm",
            hashed_password=get_password_hash("Demo2024!"),
            full_name="Mark Ziligone",
            is_active=True,
            is_superuser=False,
            created_at=datetime.utcnow()
        )
        session.add(mark)
        print("✓ Created Mark Ziligone (Recruiter)")
        print(f"  Email: mark.ziligone@smartjobmatch.zm")
        print(f"  Password: Demo2024!")
    
    if existing_brian:
        print("✓ Brian Mwale already exists")
    else:
        # Create Brian Mwale (Job Seeker)
        brian = User(
            email="brian.mwale@email.com",
            hashed_password=get_password_hash("Demo2024!"),
            full_name="Brian Mwale",
            is_active=True,
            is_superuser=False,
            created_at=datetime.utcnow()
        )
        session.add(brian)
        print("✓ Created Brian Mwale (Job Seeker)")
        print(f"  Email: brian.mwale@email.com")
        print(f"  Password: Demo2024!")
    
    session.commit()
    
    print("\n" + "=" * 80)
    print("✓ Demo users ready!")
    print("\nLogin Credentials:")
    print("-" * 80)
    print("Recruiter:")
    print("  Email: mark.ziligone@smartjobmatch.zm")
    print("  Password: Demo2024!")
    print()
    print("Job Seeker:")
    print("  Email: brian.mwale@email.com")
    print("  Password: Demo2024!")
    print("=" * 80)
    
except Exception as e:
    print(f"✗ Error: {e}")
    session.rollback()
    import traceback
    traceback.print_exc()
finally:
    session.close()
