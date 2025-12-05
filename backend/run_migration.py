"""
Run Database Migration - Add Job Status Columns
"""
import psycopg2

DB_CONFIG = {
    'host': 'localhost',
    'database': 'job_match_db',
    'user': 'postgres',
    'password': 'Winter123'
}

def run_migration():
    print("=" * 80)
    print("🔧 RUNNING DATABASE MIGRATION: Add Job Status Columns")
    print("=" * 80)
    
    try:
        # Connect to database
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        print("\n✅ Connected to database: job_match_db")
        
        # Read migration file
        with open('migrations/add_job_status_columns.sql', 'r') as f:
            migration_sql = f.read()
        
        print("\n📄 Executing migration SQL...")
        
        # Execute migration
        cursor.execute(migration_sql)
        conn.commit()
        
        print("✅ Migration executed successfully!")
        
        # Verify columns were added
        print("\n🔍 Verifying new columns...")
        
        cursor.execute("""
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'corporate_jobs'
            AND column_name IN ('status', 'created_by', 'created_at', 'updated_at')
            ORDER BY column_name;
        """)
        
        columns = cursor.fetchall()
        
        if columns:
            print("\n✅ New columns added to corporate_jobs:")
            for col in columns:
                print(f"   • {col[0]} ({col[1]}) - Nullable: {col[2]}, Default: {col[3]}")
        else:
            print("\n⚠️  Columns not found (may already exist)")
        
        # Check status values
        print("\n🔍 Checking job status distribution...")
        cursor.execute("""
            SELECT status, COUNT(*) as count
            FROM corporate_jobs
            GROUP BY status
            ORDER BY count DESC;
        """)
        
        status_counts = cursor.fetchall()
        print("\nStatus Distribution:")
        for status, count in status_counts:
            print(f"   • {status}: {count} jobs")
        
        cursor.close()
        conn.close()
        
        print("\n" + "=" * 80)
        print("✅ MIGRATION COMPLETE!")
        print("=" * 80)
        
        return True
        
    except Exception as e:
        print(f"\n❌ Migration failed: {str(e)}")
        return False


if __name__ == "__main__":
    success = run_migration()
    
    if success:
        print("\n🎯 Next Steps:")
        print("   1. Restart backend server")
        print("   2. Run: python test_job_posting_api.py")
        print("   3. Verify job creation works")
    else:
        print("\n⚠️  Please fix the error and try again")
