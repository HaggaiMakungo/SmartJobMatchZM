"""
Fix the 6 orphaned companies by creating their user accounts
"""
import os
import sys
from sqlalchemy import create_engine, text
from passlib.context import CryptContext
from dotenv import load_dotenv

load_dotenv()

# Password hasher
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:Winter123@localhost:5432/job_match_db")
engine = create_engine(DATABASE_URL)

DEFAULT_PASSWORD = "password123"

print("🔧 FIXING ORPHANED COMPANIES")
print("=" * 60)

# These are the 6 companies that don't have accounts
orphaned_companies = [
    "Avic International",
    "Multichoice",
    "Zambia National Commercial Bank (Zanaco)",
    "Zanaco",
    "Zesco",
    "Zesco Limited"
]

with engine.connect() as conn:
    trans = conn.begin()
    
    try:
        hashed_password = pwd_context.hash(DEFAULT_PASSWORD)
        
        for company_name in orphaned_companies:
            # Generate email
            email = f"{company_name.lower()}@company.zm"
            
            # Check job count
            result = conn.execute(text("""
                SELECT COUNT(*) FROM corporate_jobs WHERE company = :company;
            """), {"company": company_name})
            job_count = result.scalar()
            
            # Check if account exists
            result = conn.execute(text("""
                SELECT id FROM corp_users WHERE email = :email OR company_name = :company;
            """), {"email": email, "company": company_name})
            existing = result.fetchone()
            
            if existing:
                print(f"   ⏭️  Skipping {company_name} - account exists")
                continue
            
            # Create account
            conn.execute(text("""
                INSERT INTO corp_users (
                    email, 
                    hashed_password, 
                    company_name, 
                    company_display_name,
                    is_active,
                    is_verified
                )
                VALUES (
                    :email, 
                    :hashed_password, 
                    :company_name, 
                    :company_display_name,
                    TRUE,
                    TRUE
                );
            """), {
                "email": email,
                "hashed_password": hashed_password,
                "company_name": company_name,
                "company_display_name": company_name
            })
            
            print(f"   ✅ Created: {email:<45} | {company_name:<35} | {job_count} jobs")
        
        trans.commit()
        print("\n✅ All orphaned companies fixed!")
        
    except Exception as e:
        trans.rollback()
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()

print("=" * 60)
