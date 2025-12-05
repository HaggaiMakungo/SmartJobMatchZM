"""
Clear all data from tables and re-seed
"""
import sys
import io

if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

from app.db.session import engine, SessionLocal
from sqlalchemy import text

print("=" * 80)
print("CLEAR DATABASE AND RE-SEED")
print("=" * 80)

print("\n⚠️  WARNING: This will delete ALL data from all tables!")
response = input("Are you sure you want to continue? (yes/no): ")

if response.lower() != 'yes':
    print("Aborted.")
    sys.exit(0)

print("\n[1/2] Clearing all tables...")
try:
    with engine.connect() as conn:
        # Truncate all tables in correct order (respecting foreign keys)
        tables = [
            'user_job_interactions',
            'match_feedback',
            'industry_transitions',
            'skill_cooccurrence',
            'skills_taxonomy',
            'small_jobs',
            'corporate_jobs',
            'cvs'
        ]
        
        for table in tables:
            try:
                conn.execute(text(f"TRUNCATE TABLE {table} CASCADE"))
                conn.commit()
                print(f"  ✓ Cleared {table}")
            except Exception as e:
                print(f"  ⚠ Could not clear {table}: {e}")
        
        print("\n✓ All tables cleared")
except Exception as e:
    print(f"✗ Error clearing tables: {e}")
    sys.exit(1)

print("\n[2/2] Re-seeding database...")
try:
    import seed_database
    seed_database.main()
except Exception as e:
    print(f"✗ Seeding failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n" + "=" * 80)
print("✓ DATABASE CLEARED AND RE-SEEDED SUCCESSFULLY!")
print("=" * 80)
