"""
Migration: Create corp_users table and migrate corporate users from users table
"""
import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:Winter123@localhost:5432/job_match_db")
engine = create_engine(DATABASE_URL)

print("🔄 CREATING CORP_USERS TABLE & MIGRATING DATA")
print("=" * 60)

with engine.connect() as conn:
    # Start transaction
    trans = conn.begin()
    
    try:
        # 1. Create corp_users table
        print("\n1️⃣ Creating corp_users table...")
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS corp_users (
                id SERIAL PRIMARY KEY,
                email VARCHAR UNIQUE NOT NULL,
                hashed_password VARCHAR NOT NULL,
                company_name VARCHAR NOT NULL,
                company_display_name VARCHAR,
                contact_person VARCHAR,
                phone VARCHAR,
                is_active BOOLEAN DEFAULT TRUE,
                is_verified BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE
            );
        """))
        
        # Create indexes
        print("   Creating indexes...")
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_corp_users_email ON corp_users(email);
            CREATE INDEX IF NOT EXISTS idx_corp_users_company ON corp_users(company_name);
        """))
        
        print("   ✅ Table created!")
        
        # 2. Find corporate users (those with @company.zm emails)
        print("\n2️⃣ Finding corporate users in users table...")
        result = conn.execute(text("""
            SELECT id, email, hashed_password, created_at
            FROM users
            WHERE email LIKE '%@company.zm';
        """))
        corp_users = result.fetchall()
        print(f"   Found {len(corp_users)} corporate users")
        
        # 3. Migrate each corporate user
        if corp_users:
            print("\n3️⃣ Migrating users to corp_users table...")
            migrated = 0
            for user in corp_users:
                user_id, email, hashed_password, created_at = user
                
                # Extract company name from email (e.g., dhl@company.zm -> DHL)
                company_name = email.split('@')[0].upper()
                
                # Insert into corp_users
                conn.execute(text("""
                    INSERT INTO corp_users (email, hashed_password, company_name, created_at)
                    VALUES (:email, :hashed_password, :company_name, :created_at)
                    ON CONFLICT (email) DO NOTHING;
                """), {
                    "email": email,
                    "hashed_password": hashed_password,
                    "company_name": company_name,
                    "created_at": created_at
                })
                
                migrated += 1
                print(f"   ✅ Migrated: {email} -> Company: {company_name}")
            
            print(f"\n   Total migrated: {migrated} users")
        
        # 4. Verify migration
        print("\n4️⃣ Verifying migration...")
        result = conn.execute(text("""
            SELECT company_name, COUNT(*) as count
            FROM corp_users
            GROUP BY company_name
            ORDER BY company_name;
        """))
        companies = result.fetchall()
        
        print("   Corporate users by company:")
        for company, count in companies:
            print(f"   - {company}: {count} user(s)")
        
        # 5. Show what's in corp_users now
        print("\n5️⃣ Current corp_users table:")
        result = conn.execute(text("""
            SELECT id, email, company_name, is_active, created_at
            FROM corp_users
            ORDER BY company_name, email;
        """))
        all_corp_users = result.fetchall()
        
        for user_id, email, company, is_active, created_at in all_corp_users:
            status = "✅" if is_active else "❌"
            print(f"   {status} [{user_id}] {email} | Company: {company}")
        
        # Commit transaction
        trans.commit()
        print("\n" + "=" * 60)
        print("✅ MIGRATION COMPLETE!")
        print("\n📝 Next steps:")
        print("   1. Update authentication to use corp_users table")
        print("   2. Update corporate.py API to use CorpUser model")
        print("   3. Test login with corporate accounts")
        
    except Exception as e:
        trans.rollback()
        print(f"\n❌ ERROR: {e}")
        print("   Migration rolled back - no changes made")
        sys.exit(1)

print("\n" + "=" * 60)
