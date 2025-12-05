"""
Populate corp_users table with accounts for ALL companies that have jobs
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

# Default password for all accounts
DEFAULT_PASSWORD = "password123"

print("👥 CREATING CORP_USERS FOR ALL COMPANIES")
print("=" * 60)

with engine.connect() as conn:
    trans = conn.begin()
    
    try:
        # 1. Get ALL unique companies from corporate_jobs
        print("\n1️⃣ Finding all companies in corporate_jobs table...")
        result = conn.execute(text("""
            SELECT DISTINCT company, COUNT(*) as job_count
            FROM corporate_jobs
            GROUP BY company
            ORDER BY company;
        """))
        companies = result.fetchall()
        
        print(f"   Found {len(companies)} unique companies:")
        for company, count in companies:
            print(f"   - {company}: {count} jobs")
        
        if len(companies) == 0:
            print("\n   ⚠️  No companies found in corporate_jobs table!")
            print("   Please populate the corporate_jobs table first.")
            trans.rollback()
            sys.exit(1)
        
        # 2. Hash the default password once (more efficient)
        print(f"\n2️⃣ Hashing password...")
        hashed_password = pwd_context.hash(DEFAULT_PASSWORD)
        print(f"   ✅ Password hashed")
        
        # 3. Create account for each company
        print(f"\n3️⃣ Creating {len(companies)} corporate user accounts...")
        created = 0
        updated = 0
        
        for company_name, job_count in companies:
            # Generate email: company@company.zm (lowercase)
            email = f"{company_name.lower()}@company.zm"
            
            # Use company name as-is for display
            company_display_name = company_name
            
            # Check if account already exists
            result = conn.execute(text("""
                SELECT id FROM corp_users WHERE email = :email;
            """), {"email": email})
            existing = result.fetchone()
            
            if existing:
                # Update existing account
                conn.execute(text("""
                    UPDATE corp_users SET
                        hashed_password = :hashed_password,
                        company_name = :company_name,
                        company_display_name = :company_display_name,
                        is_active = TRUE,
                        is_verified = TRUE
                    WHERE email = :email;
                """), {
                    "email": email,
                    "hashed_password": hashed_password,
                    "company_name": company_name,
                    "company_display_name": company_display_name
                })
                updated += 1
                print(f"   🔄 Updated: {email:30s} | {company_name:20s} | {job_count:3d} jobs")
            else:
                # Insert new account
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
                    "company_display_name": company_display_name
                })
                created += 1
                print(f"   ✅ Created: {email:30s} | {company_name:20s} | {job_count:3d} jobs")
        
        print(f"\n   Total created: {created} new accounts")
        print(f"   Total updated: {updated} existing accounts")
        
        # 4. Verify what's in the table now
        print("\n4️⃣ Verifying corp_users table...")
        result = conn.execute(text("""
            SELECT 
                cu.email, 
                cu.company_name, 
                cu.company_display_name, 
                cu.is_active,
                COUNT(cj.job_id) as job_count
            FROM corp_users cu
            LEFT JOIN corporate_jobs cj ON cu.company_name = cj.company
            GROUP BY cu.email, cu.company_name, cu.company_display_name, cu.is_active
            ORDER BY cu.company_name;
        """))
        all_users = result.fetchall()
        
        print(f"\n   Total corporate users: {len(all_users)}")
        print("\n   📋 Complete Account List:")
        print("   " + "-" * 80)
        print(f"   {'Email':<35} {'Company':<20} {'Jobs':<6} {'Status'}")
        print("   " + "-" * 80)
        
        total_jobs = 0
        for email, company_name, display_name, is_active, job_count in all_users:
            status = "✅" if is_active else "❌"
            print(f"   {email:<35} {company_name:<20} {job_count:<6} {status}")
            total_jobs += job_count
        
        print("   " + "-" * 80)
        print(f"   Total: {len(all_users)} companies with {total_jobs} total jobs")
        
        # 5. Show any companies with mismatched names
        print("\n5️⃣ Checking for potential naming issues...")
        result = conn.execute(text("""
            SELECT DISTINCT cj.company
            FROM corporate_jobs cj
            LEFT JOIN corp_users cu ON cj.company = cu.company_name
            WHERE cu.company_name IS NULL;
        """))
        orphaned_companies = result.fetchall()
        
        if orphaned_companies:
            print(f"   ⚠️  Found {len(orphaned_companies)} companies in jobs without user accounts:")
            for (company,) in orphaned_companies:
                print(f"   - {company}")
            print("   (These should have been created - check for issues)")
        else:
            print("   ✅ All companies have matching user accounts!")
        
        # Commit transaction
        trans.commit()
        
        print("\n" + "=" * 60)
        print("✅ CORP_USERS POPULATED SUCCESSFULLY!")
        print(f"\n📊 Summary:")
        print(f"   - Total companies: {len(all_users)}")
        print(f"   - New accounts: {created}")
        print(f"   - Updated accounts: {updated}")
        print(f"   - Total jobs: {total_jobs}")
        
        print("\n🔐 ALL Accounts use:")
        print("   Password: password123")
        
        print("\n📝 Example Logins:")
        # Show first 10 as examples
        for email, company_name, display_name, is_active, job_count in all_users[:10]:
            print(f"   - {email} ({job_count} jobs)")
        if len(all_users) > 10:
            print(f"   ... and {len(all_users) - 10} more accounts")
        
        print("\n🚀 Next Steps:")
        print("   1. Update backend auth to use corp_users table")
        print("   2. Test login with any company account")
        print("   3. Verify company isolation works")
        print("   4. Check that all jobs appear correctly")
        
    except Exception as e:
        trans.rollback()
        print(f"\n❌ ERROR: {e}")
        print("   Changes rolled back")
        import traceback
        traceback.print_exc()
        raise

print("\n" + "=" * 60)
