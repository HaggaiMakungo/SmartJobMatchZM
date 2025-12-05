"""
Database Connection Test
Quick script to verify PostgreSQL connection and database status
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

print("=" * 80)
print("DATABASE CONNECTION TEST")
print("=" * 80)

# Test 1: Import dependencies
print("\n[1/4] Testing imports...")
try:
    from app.db.session import engine, SessionLocal
    from sqlalchemy import text
    print("✓ SQLAlchemy imports successful")
except ImportError as e:
    print(f"✗ Import failed: {e}")
    print("\nMake sure you've installed requirements:")
    print("  pip install -r requirements.txt")
    sys.exit(1)

# Test 2: Database connection
print("\n[2/4] Testing database connection...")
try:
    with engine.connect() as conn:
        result = conn.execute(text("SELECT version()"))
        version = result.scalar()
        print(f"✓ Connected to PostgreSQL")
        print(f"  Version: {version[:50]}...")
except Exception as e:
    print(f"✗ Connection failed: {e}")
    print("\nTroubleshooting:")
    print("1. Check PostgreSQL is running")
    print("2. Verify .env DATABASE_URL is correct")
    print("3. Ensure database 'job_match_db' exists")
    sys.exit(1)

# Test 3: Check if tables exist
print("\n[3/4] Checking database tables...")
try:
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        """))
        tables = [row[0] for row in result]
        
        expected_tables = [
            'cvs',
            'corporate_jobs',
            'small_jobs',
            'skills_taxonomy',
            'skill_cooccurrence',
            'industry_transitions',
            'user_job_interactions',
            'match_feedback',
            'alembic_version'  # Alembic metadata table
        ]
        
        if not tables:
            print("✗ No tables found")
            print("\nRun migrations first:")
            print("  alembic upgrade head")
            sys.exit(1)
        
        print(f"✓ Found {len(tables)} tables:")
        for table in tables:
            status = "✓" if table in expected_tables else "?"
            print(f"  {status} {table}")
        
        missing = set(expected_tables) - set(tables)
        if missing:
            print(f"\n⚠ Missing tables: {', '.join(missing)}")
            print("Run migrations: alembic upgrade head")
            
except Exception as e:
    print(f"✗ Error checking tables: {e}")
    sys.exit(1)

# Test 4: Check data
print("\n[4/4] Checking data counts...")
try:
    session = SessionLocal()
    
    data_tables = {
        'cvs': 2500,
        'corporate_jobs': 500,
        'small_jobs': 400,
        'skills_taxonomy': 500,
        'skill_cooccurrence': 100,
        'industry_transitions': 50,
        'user_job_interactions': 0,  # Empty until matching starts
        'match_feedback': 0  # Empty until matching starts
    }
    
    all_counts_good = True
    for table, expected in data_tables.items():
        try:
            result = session.execute(text(f"SELECT COUNT(*) FROM {table}"))
            count = result.scalar()
            
            if count == 0 and expected > 0:
                status = "⚠"
                all_counts_good = False
            elif count == expected:
                status = "✓"
            else:
                status = "?"
                all_counts_good = False
            
            print(f"  {status} {table}: {count:,} records (expected: {expected:,})")
        except Exception as e:
            print(f"  ✗ {table}: Error - {e}")
            all_counts_good = False
    
    session.close()
    
    if not all_counts_good:
        print("\n⚠ Some tables are empty or have unexpected counts")
        print("Run seeding script: python seed_database.py")
    else:
        print("\n✓ All data counts look good!")
        
except Exception as e:
    print(f"✗ Error checking data: {e}")
    sys.exit(1)

# Summary
print("\n" + "=" * 80)
print("CONNECTION TEST COMPLETE")
print("=" * 80)

if all_counts_good and len(tables) >= 8:
    print("\n✅ Database is fully set up and ready!")
    print("\nNext steps:")
    print("  1. Implement matching algorithms")
    print("  2. Build API endpoints")
    print("  3. Start testing")
else:
    print("\n⚠ Database needs attention:")
    if len(tables) < 8:
        print("  → Run migrations: alembic upgrade head")
    if not all_counts_good:
        print("  → Seed database: python seed_database.py")

print("\nRefer to DATABASE_QUICKSTART.md for setup instructions")
