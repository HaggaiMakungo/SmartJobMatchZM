"""
Check for duplicate CVs in the database
"""

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

def check_duplicates():
    """Check for duplicate CVs"""
    
    print("🔍 CHECKING FOR DUPLICATE CVs")
    print("=" * 60)
    
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    try:
        # Check Beauty Njovu specifically
        print("\n1️⃣  Checking 'Beauty Njovu' records...")
        sql = text("""
        SELECT cv_id, full_name, email, current_job_title
        FROM cvs
        WHERE full_name = 'Beauty Njovu'
        ORDER BY cv_id;
        """)
        
        results = db.execute(sql).fetchall()
        print(f"   Found {len(results)} records for 'Beauty Njovu':")
        for row in results:
            print(f"      CV ID: {row[0]}, Email: {row[2]}, Position: {row[3]}")
        
        # Check embeddings cache for Beauty Njovu
        print("\n2️⃣  Checking embeddings_cache for Beauty Njovu CVs...")
        cv_ids = [row[0] for row in results]
        if cv_ids:
            placeholders = ','.join([f"'{cv_id}'" for cv_id in cv_ids])
            sql = text(f"""
            SELECT entity_id, skills_normalized
            FROM embeddings_cache
            WHERE entity_id IN ({placeholders})
            ORDER BY entity_id;
            """)
            
            embeddings = db.execute(sql).fetchall()
            print(f"   Found {len(embeddings)} embeddings:")
            for row in embeddings:
                print(f"      Entity ID: {row[0]}, Skills: {row[1][:5]}...")
        
        # Check for duplicate CV IDs in embeddings_cache
        print("\n3️⃣  Checking for duplicate CV IDs in embeddings_cache...")
        sql = text("""
        SELECT entity_id, COUNT(*) as count
        FROM embeddings_cache
        WHERE entity_type = 'cv'
        GROUP BY entity_id
        HAVING COUNT(*) > 1
        LIMIT 10;
        """)
        
        duplicates = db.execute(sql).fetchall()
        if duplicates:
            print(f"   ⚠️  Found {len(duplicates)} duplicate CV IDs in cache:")
            for row in duplicates:
                print(f"      {row[0]}: {row[1]} copies")
        else:
            print("   ✅ No duplicate CV IDs in embeddings_cache")
        
        # Check total unique names vs total CVs
        print("\n4️⃣  Checking unique names vs total CVs...")
        
        total_sql = text("SELECT COUNT(*) FROM cvs;")
        total = db.execute(total_sql).scalar()
        
        unique_sql = text("SELECT COUNT(DISTINCT full_name) FROM cvs;")
        unique = db.execute(unique_sql).scalar()
        
        print(f"   Total CVs: {total}")
        print(f"   Unique names: {unique}")
        print(f"   Duplicates: {total - unique}")
        
        if total != unique:
            print("\n   ⚠️  This database has duplicate names!")
            print("   This is normal if:")
            print("      - Same person applied multiple times")
            print("      - Common names (e.g., multiple 'John Smith')")
            print("\n   SOLUTION: Use cv_id + name for uniqueness")
        
        print("\n" + "=" * 60)
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    check_duplicates()
