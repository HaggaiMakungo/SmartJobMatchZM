"""
Check the actual schema of cvs and corporate_jobs tables
"""

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

def check_schema():
    """Check table schemas"""
    
    print("🔍 CHECKING DATABASE SCHEMA")
    print("=" * 60)
    
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    try:
        # Check CVs table
        print("\n📋 CVs Table Columns:")
        print("-" * 60)
        
        cv_schema_sql = text("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'cvs'
        ORDER BY ordinal_position;
        """)
        
        result = db.execute(cv_schema_sql)
        cv_columns = []
        for row in result:
            print(f"  {row[0]}: {row[1]}")
            cv_columns.append(row[0])
        
        # Check Jobs table
        print("\n💼 Corporate Jobs Table Columns:")
        print("-" * 60)
        
        job_schema_sql = text("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'corporate_jobs'
        ORDER BY ordinal_position;
        """)
        
        result = db.execute(job_schema_sql)
        job_columns = []
        for row in result:
            print(f"  {row[0]}: {row[1]}")
            job_columns.append(row[0])
        
        # Sample CV data
        print("\n📄 Sample CV Data:")
        print("-" * 60)
        
        sample_cv_sql = text("""
        SELECT * FROM cvs LIMIT 1;
        """)
        
        result = db.execute(sample_cv_sql)
        row = result.fetchone()
        if row:
            for i, col in enumerate(cv_columns):
                value = row[i]
                if isinstance(value, str) and len(value) > 100:
                    value = value[:100] + "..."
                print(f"  {col}: {value}")
        
        # Sample Job data
        print("\n💼 Sample Job Data:")
        print("-" * 60)
        
        sample_job_sql = text("""
        SELECT * FROM corporate_jobs LIMIT 1;
        """)
        
        result = db.execute(sample_job_sql)
        row = result.fetchone()
        if row:
            for i, col in enumerate(job_columns):
                value = row[i]
                if isinstance(value, str) and len(value) > 100:
                    value = value[:100] + "..."
                print(f"  {col}: {value}")
        
        print("\n" + "=" * 60)
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    check_schema()
