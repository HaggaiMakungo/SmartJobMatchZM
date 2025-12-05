"""
Seed script to create an HR Manager user for ZedSafe Logistics
This user will manage CORPORATE jobs through the recruiter dashboard.
"""

import asyncio
from sqlalchemy.orm import Session
from app.db.session import get_db_sync
from app.models.user import User
from app.models.employer import EmployerProfile
from app.core.security import get_password_hash

async def seed_hr_manager():
    """Create HR Manager user for ZedSafe Logistics"""
    db = next(get_db_sync())
    
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(
            User.email == "chipo.musonda@zedsafe.co.zm"
        ).first()
        
        if existing_user:
            print("✅ HR Manager already exists!")
            print(f"   Email: chipo.musonda@zedsafe.co.zm")
            print(f"   Password: ZedSafe2024")
            return
        
        # Create User account
        user = User(
            email="chipo.musonda@zedsafe.co.zm",
            hashed_password=get_password_hash("ZedSafe2024"),
            full_name="Chipo Musonda",
            user_type="employer",
            is_active=True,
            is_verified=True
        )
        db.add(user)
        db.flush()
        
        # Create Employer Profile
        employer_profile = EmployerProfile(
            user_id=user.user_id,
            company_name="ZedSafe Logistics",
            industry="Logistics & Supply Chain",
            company_size="51-200",
            website="https://zedsafe.co.zm",
            description="Leading logistics and supply chain solutions provider in Zambia. We specialize in freight forwarding, warehousing, and distribution services across Southern Africa.",
            location="Lusaka",
            province="Lusaka",
            contact_email="hr@zedsafe.co.zm",
            contact_phone="+260 211 123456"
        )
        db.add(employer_profile)
        
        db.commit()
        
        print("\n🎉 HR Manager Created Successfully!")
        print("\n" + "="*50)
        print("LOGIN CREDENTIALS")
        print("="*50)
        print(f"Name:     Chipo Musonda")
        print(f"Email:    chipo.musonda@zedsafe.co.zm")
        print(f"Password: ZedSafe2024")
        print(f"Company:  ZedSafe Logistics")
        print(f"Role:     HR Manager")
        print("="*50)
        print("\n📋 User Details:")
        print(f"   - User ID: {user.user_id}")
        print(f"   - User Type: {user.user_type}")
        print(f"   - Industry: Logistics & Supply Chain")
        print(f"   - Location: Lusaka, Zambia")
        print("\n🎯 Access:")
        print("   - Recruiter Dashboard: http://localhost:3000")
        print("   - Manages: CORPORATE jobs (professional positions)")
        print("   - Can: Post jobs, view applicants, hire candidates")
        print("\n⚠️  Note:")
        print("   This is NOT for personal/small jobs")
        print("   Use Mark Ziligone for personal jobs")
        print("\n✅ Ready to use!")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating HR Manager: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("\n🚀 Creating HR Manager for ZedSafe Logistics...")
    asyncio.run(seed_hr_manager())
