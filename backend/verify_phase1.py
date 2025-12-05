"""
Quick Verification - Check if Phase 1 is ready
"""
import os
import psycopg2

def check_files():
    """Check if all required files exist"""
    print("=" * 80)
    print("📁 CHECKING FILES")
    print("=" * 80)
    
    files = [
        ("Migration", "migrations/add_job_status_columns.sql"),
        ("Model", "app/models/corporate_job.py"),
        ("API", "app/api/v1/corporate.py"),
        ("Test", "test_job_posting_api.py"),
        ("Migration Runner", "run_migration.py"),
    ]
    
    all_exist = True
    for name, path in files:
        exists = os.path.exists(path)
        status = "✅" if exists else "❌"
        print(f"{status} {name}: {path}")
        if not exists:
            all_exist = False
    
    return all_exist


def check_database():
    """Check if database columns exist"""
    print("\n" + "=" * 80)
    print("🗄️  CHECKING DATABASE")
    print("=" * 80)
    
    try:
        conn = psycopg2.connect(
            host='localhost',
            database='job_match_db',
            user='postgres',
            password='Winter123'
        )
        cursor = conn.cursor()
        
        print("✅ Connected to database")
        
        # Check for status column
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns
            WHERE table_name = 'corporate_jobs'
            AND column_name IN ('status', 'created_by', 'created_at', 'updated_at')
        """)
        
        columns = [col[0] for col in cursor.fetchall()]
        
        required_columns = ['status', 'created_by', 'created_at', 'updated_at']
        
        for col in required_columns:
            if col in columns:
                print(f"✅ Column exists: {col}")
            else:
                print(f"❌ Column missing: {col}")
                print(f"   Run: python run_migration.py")
                return False
        
        cursor.close()
        conn.close()
        
        return True
        
    except Exception as e:
        print(f"❌ Database check failed: {str(e)}")
        return False


def check_imports():
    """Check if Python imports work"""
    print("\n" + "=" * 80)
    print("🐍 CHECKING PYTHON IMPORTS")
    print("=" * 80)
    
    try:
        from app.models.corporate_job import CorporateJob
        print("✅ CorporateJob model imports")
        
        from app.api.v1.corporate import router
        print("✅ Corporate API router imports")
        
        from app.schemas.job import CorporateJobCreate
        print("✅ Job schemas import")
        
        return True
        
    except Exception as e:
        print(f"❌ Import failed: {str(e)}")
        return False


def main():
    print("\n" + "=" * 80)
    print("🔍 PHASE 1 VERIFICATION")
    print("=" * 80)
    
    checks = {
        "Files": check_files(),
        "Database": check_database(),
        "Imports": check_imports()
    }
    
    print("\n" + "=" * 80)
    print("📊 RESULTS")
    print("=" * 80)
    
    for name, passed in checks.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} - {name}")
    
    if all(checks.values()):
        print("\n" + "=" * 80)
        print("🎉 PHASE 1 READY!")
        print("=" * 80)
        print("\n📋 Next steps:")
        print("  1. Start backend: python -m uvicorn app.main:app --reload")
        print("  2. Test API: python test_job_posting_api.py")
        print("  3. Move to Phase 2: Web Dashboard UI")
    else:
        print("\n" + "=" * 80)
        print("⚠️  PHASE 1 NOT READY")
        print("=" * 80)
        print("\n📋 To fix:")
        if not checks["Database"]:
            print("  1. Run migration: python run_migration.py")
        if not checks["Imports"]:
            print("  2. Restart Python/IDE to reload modules")
        print("  3. Run this script again to verify")


if __name__ == "__main__":
    main()
