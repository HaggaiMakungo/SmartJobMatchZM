"""
Add company column to users table and populate from emails
Run this ONCE: python add_company_to_users.py
"""
from app.db.session import engine, SessionLocal
from sqlalchemy import text

def add_company_column():
    """Add company column to users table"""
    db = SessionLocal()
    
    try:
        # 1. Add company column
        print("Adding company column to users table...")
        db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS company VARCHAR"))
        db.commit()
        print("✅ Column added!")
        
        # 2. Extract and update company names from emails
        print("\nExtracting company names from emails...")
        users = db.execute(text("SELECT id, email FROM users")).fetchall()
        
        updated = 0
        for user_id, email in users:
            # Extract company from email (e.g., "dhl@company.zm" -> "DHL")
            if "@" in email:
                company_part = email.split("@")[0]
                company_name = company_part.upper()  # Capitalize
                
                db.execute(
                    text("UPDATE users SET company = :company WHERE id = :user_id"),
                    {"company": company_name, "user_id": user_id}
                )
                updated += 1
                print(f"  ✅ {email} -> Company: {company_name}")
        
        db.commit()
        print(f"\n✅ Updated {updated} users with company names!")
        
        # 3. Add index for performance
        print("\nAdding index on company column...")
        db.execute(text("CREATE INDEX IF NOT EXISTS idx_users_company ON users(company)"))
        db.commit()
        print("✅ Index created!")
        
        # 4. Show results
        print("\n📊 Final user-company mapping:")
        result = db.execute(text("SELECT id, email, company FROM users ORDER BY company")).fetchall()
        for user_id, email, company in result:
            print(f"  {email:30s} -> {company}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("=" * 60)
    print("ADDING COMPANY COLUMN TO USERS TABLE")
    print("=" * 60)
    add_company_column()
    print("\n✅ Migration complete!")
