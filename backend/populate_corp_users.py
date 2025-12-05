"""
Populate corp_users table with test company accounts
"""
import os
from sqlalchemy import create_engine, text
from passlib.context import CryptContext
from dotenv import load_dotenv

load_dotenv()

# Password hasher
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:Winter123@localhost:5432/job_match_db")
engine = create_engine(DATABASE_URL)

# Company accounts to create
COMPANIES = [
    {
        "email": "dhl@company.zm",
        "password": "password123",
        "company_name": "DHL",
        "company_display_name": "DHL Express Zambia",
        "contact_person": "Logistics Manager"
    },
    {
        "email": "zanaco@company.zm",
        "password": "password123",
        "company_name": "ZANACO",
        "company_display_name": "Zanaco Bank",
        "contact_person": "HR Manager"
    },
    {
        "email": "choppies@company.zm",
        "password": "password123",
        "company_name": "CHOPPIES",
        "company_display_name": "Choppies Supermarkets Zambia",
        "contact_person": "Retail Manager"
    },
    {
        "email": "mtn@company.zm",
        "password": "password123",
        "company_name": "MTN",
        "company_display_name": "MTN Zambia",
        "contact_person": "Talent Acquisition"
    },
    {
        "email": "zesco@company.zm",
        "password": "password123",
        "company_name": "ZESCO",
        "company_display_name": "ZESCO Limited",
        "contact_person": "HR Director"
    },
    {
        "email": "airtel@company.zm",
        "password": "password123",
        "company_name": "AIRTEL",
        "company_display_name": "Airtel Zambia",
        "contact_person": "Recruitment Lead"
    },
    {
        "email": "shoprite@company.zm",
        "password": "password123",
        "company_name": "SHOPRITE",
        "company_display_name": "Shoprite Zambia",
        "contact_person": "Store Manager"
    },
    {
        "email": "zambeef@company.zm",
        "password": "password123",
        "company_name": "ZAMBEEF",
        "company_display_name": "Zambeef Products PLC",
        "contact_person": "Operations Manager"
    },
    {
        "email": "fqm@company.zm",
        "password": "password123",
        "company_name": "FQM",
        "company_display_name": "First Quantum Minerals",
        "contact_person": "Mining HR"
    },
    {
        "email": "unza@company.zm",
        "password": "password123",
        "company_name": "UNZA",
        "company_display_name": "University of Zambia",
        "contact_person": "Academic Registrar"
    }
]

print("👥 POPULATING CORP_USERS TABLE")
print("=" * 60)

with engine.connect() as conn:
    trans = conn.begin()
    
    try:
        # Check what companies exist in corporate_jobs
        print("\n1️⃣ Checking companies in corporate_jobs table...")
        result = conn.execute(text("""
            SELECT DISTINCT company, COUNT(*) as job_count
            FROM corporate_jobs
            GROUP BY company
            ORDER BY company;
        """))
        existing_companies = result.fetchall()
        
        print(f"   Found {len(existing_companies)} companies with jobs:")
        for company, count in existing_companies:
            print(f"   - {company}: {count} jobs")
        
        # Create a set of existing companies for matching
        existing_company_names = {company.upper() for company, _ in existing_companies}
        
        print(f"\n2️⃣ Creating {len(COMPANIES)} corporate user accounts...")
        created = 0
        
        for company in COMPANIES:
            # Hash the password
            hashed_password = pwd_context.hash(company["password"])
            
            # Check if this company has jobs
            has_jobs = company["company_name"].upper() in existing_company_names
            job_indicator = "✅ HAS JOBS" if has_jobs else "⚠️  NO JOBS YET"
            
            # Insert into corp_users
            conn.execute(text("""
                INSERT INTO corp_users (
                    email, 
                    hashed_password, 
                    company_name, 
                    company_display_name,
                    contact_person,
                    is_active,
                    is_verified
                )
                VALUES (
                    :email, 
                    :hashed_password, 
                    :company_name, 
                    :company_display_name,
                    :contact_person,
                    TRUE,
                    TRUE
                )
                ON CONFLICT (email) DO UPDATE SET
                    hashed_password = EXCLUDED.hashed_password,
                    company_name = EXCLUDED.company_name,
                    company_display_name = EXCLUDED.company_display_name,
                    contact_person = EXCLUDED.contact_person;
            """), {
                "email": company["email"],
                "hashed_password": hashed_password,
                "company_name": company["company_name"],
                "company_display_name": company["company_display_name"],
                "contact_person": company["contact_person"]
            })
            
            created += 1
            print(f"   ✅ Created: {company['email']} | Company: {company['company_name']} | {job_indicator}")
        
        print(f"\n   Total created: {created} corporate users")
        
        # Verify what was created
        print("\n3️⃣ Verifying corp_users table...")
        result = conn.execute(text("""
            SELECT email, company_name, company_display_name, is_active
            FROM corp_users
            ORDER BY company_name;
        """))
        all_users = result.fetchall()
        
        print(f"   Total corporate users: {len(all_users)}")
        print("\n   Account List:")
        for email, company_name, display_name, is_active in all_users:
            status = "✅ Active" if is_active else "❌ Inactive"
            print(f"   {status} | {email:30s} | {company_name:15s} | {display_name}")
        
        # Show which companies need job data
        print("\n4️⃣ Company-Job Matching Status:")
        for email, company_name, display_name, is_active in all_users:
            # Check if company has jobs
            result = conn.execute(text("""
                SELECT COUNT(*) 
                FROM corporate_jobs 
                WHERE company = :company_name;
            """), {"company_name": company_name})
            job_count = result.scalar()
            
            if job_count > 0:
                print(f"   ✅ {company_name:15s} has {job_count:3d} jobs")
            else:
                print(f"   ⚠️  {company_name:15s} has   0 jobs - NEEDS DATA!")
        
        # Commit transaction
        trans.commit()
        
        print("\n" + "=" * 60)
        print("✅ CORP_USERS POPULATED SUCCESSFULLY!")
        print("\n📝 Test Accounts (all use password: password123):")
        for company in COMPANIES:
            print(f"   - {company['email']}")
        
        print("\n🔐 Login with any account:")
        print("   Email: [any above]")
        print("   Password: password123")
        
        print("\n🚀 Next Steps:")
        print("   1. Update backend auth to use corp_users")
        print("   2. Test login in frontend")
        print("   3. Verify company isolation works")
        
    except Exception as e:
        trans.rollback()
        print(f"\n❌ ERROR: {e}")
        print("   Changes rolled back")
        raise

print("\n" + "=" * 60)
