"""
Sprint B - Phase 3: Populate Embeddings
Compute and cache embeddings for all CVs and jobs in the database
"""

import sys
import time
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Import the embedding service from Phase 2
import importlib.util
spec = importlib.util.spec_from_file_location(
    "embedding_service", 
    "sprint_b_phase2_embedding_service.py"
)
embedding_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(embedding_module)
EmbeddingService = embedding_module.EmbeddingService


def populate_cv_embeddings():
    """Populate embeddings for all CVs"""
    
    print("📊 POPULATING CV EMBEDDINGS")
    print("=" * 60)
    
    # Create database connection
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    try:
        # 1. Count total CVs
        print("\n1️⃣  Counting CVs...")
        count_sql = text("SELECT COUNT(*) FROM cvs;")
        total_cvs = db.execute(count_sql).scalar()
        print(f"   ✅ Found {total_cvs} CVs in database")
        
        # 2. Check how many already have embeddings
        cached_sql = text("""
        SELECT COUNT(*) FROM embeddings_cache WHERE entity_type = 'cv';
        """)
        cached_count = db.execute(cached_sql).scalar()
        print(f"   ℹ️  {cached_count} CVs already have cached embeddings")
        
        # 3. Fetch all CVs
        print("\n2️⃣  Fetching CV data...")
        fetch_sql = text("""
        SELECT cv_id, skills
        FROM cvs
        WHERE skills IS NOT NULL 
          AND array_length(skills, 1) > 0
        ORDER BY cv_id;
        """)
        
        result = db.execute(fetch_sql)
        cv_data = []
        
        for row in result:
            cv_data.append({
                "cv_id": row[0],
                "skills": row[1] if row[1] else []
            })
        
        print(f"   ✅ Fetched {len(cv_data)} CVs with skills")
        
        if not cv_data:
            print("   ⚠️  No CVs with skills found!")
            return
        
        # 4. Initialize embedding service
        print("\n3️⃣  Initializing embedding service...")
        service = EmbeddingService()
        print(f"   ✅ Service ready (model: {service.model_name})")
        
        # 5. Process all CVs
        print(f"\n4️⃣  Computing embeddings for {len(cv_data)} CVs...")
        print("   (This will take ~50-60 seconds for 2,500 CVs)")
        
        result = service.batch_save_cv_embeddings(db, cv_data, batch_size=100)
        
        # 6. Verify results
        print("\n5️⃣  Verifying embeddings...")
        verify_sql = text("""
        SELECT COUNT(*) FROM embeddings_cache WHERE entity_type = 'cv';
        """)
        final_count = db.execute(verify_sql).scalar()
        print(f"   ✅ Total CV embeddings in cache: {final_count}")
        
        # Sample some embeddings
        sample_sql = text("""
        SELECT entity_id, skills_normalized, 
               jsonb_array_length(embedding) as dims,
               computed_at
        FROM embeddings_cache 
        WHERE entity_type = 'cv'
        LIMIT 3;
        """)
        
        print("\n   Sample embeddings:")
        for row in db.execute(sample_sql):
            print(f"      {row[0]}: {len(row[1])} skills, {row[2]} dims, {row[3]}")
        
        print("\n" + "=" * 60)
        print("✅ CV EMBEDDINGS COMPLETE!")
        print()
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


def populate_job_embeddings():
    """Populate embeddings for all jobs"""
    
    print("\n📊 POPULATING JOB EMBEDDINGS")
    print("=" * 60)
    
    # Create database connection
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    try:
        # 1. Count total jobs
        print("\n1️⃣  Counting jobs...")
        count_sql = text("SELECT COUNT(*) FROM corporate_jobs;")
        total_jobs = db.execute(count_sql).scalar()
        print(f"   ✅ Found {total_jobs} jobs in database")
        
        # 2. Check how many already have embeddings
        cached_sql = text("""
        SELECT COUNT(*) FROM embeddings_cache WHERE entity_type = 'job';
        """)
        cached_count = db.execute(cached_sql).scalar()
        print(f"   ℹ️  {cached_count} jobs already have cached embeddings")
        
        # 3. Fetch all jobs
        print("\n2️⃣  Fetching job data...")
        fetch_sql = text("""
        SELECT job_id, skills_required
        FROM corporate_jobs
        WHERE skills_required IS NOT NULL 
          AND array_length(skills_required, 1) > 0
        ORDER BY job_id;
        """)
        
        result = db.execute(fetch_sql)
        job_data = []
        
        for row in result:
            job_data.append({
                "job_id": row[0],
                "skills_required": row[1] if row[1] else []
            })
        
        print(f"   ✅ Fetched {len(job_data)} jobs with skills")
        
        if not job_data:
            print("   ⚠️  No jobs with skills found!")
            return
        
        # 4. Initialize embedding service
        print("\n3️⃣  Initializing embedding service...")
        service = EmbeddingService()
        print(f"   ✅ Service ready (model already loaded)")
        
        # 5. Process all jobs
        print(f"\n4️⃣  Computing embeddings for {len(job_data)} jobs...")
        
        result = service.batch_save_job_embeddings(db, job_data)
        
        # 6. Verify results
        print("\n5️⃣  Verifying embeddings...")
        verify_sql = text("""
        SELECT COUNT(*) FROM embeddings_cache WHERE entity_type = 'job';
        """)
        final_count = db.execute(verify_sql).scalar()
        print(f"   ✅ Total job embeddings in cache: {final_count}")
        
        # Sample some embeddings
        sample_sql = text("""
        SELECT entity_id, skills_normalized, 
               jsonb_array_length(embedding) as dims,
               computed_at
        FROM embeddings_cache 
        WHERE entity_type = 'job'
        LIMIT 3;
        """)
        
        print("\n   Sample embeddings:")
        for row in db.execute(sample_sql):
            print(f"      {row[0]}: {len(row[1])} skills, {row[2]} dims, {row[3]}")
        
        print("\n" + "=" * 60)
        print("✅ JOB EMBEDDINGS COMPLETE!")
        print()
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


def main():
    """Main function to populate all embeddings"""
    
    print("\n🚀 SPRINT B - PHASE 3: POPULATE ALL EMBEDDINGS")
    print("=" * 60)
    print()
    
    start_time = time.time()
    
    # Step 1: Populate CV embeddings
    populate_cv_embeddings()
    
    # Step 2: Populate job embeddings
    populate_job_embeddings()
    
    # Summary
    total_time = time.time() - start_time
    
    print("\n" + "=" * 60)
    print("🎉 ALL EMBEDDINGS POPULATED!")
    print(f"   Total time: {total_time:.2f}s")
    print()
    print("Next steps:")
    print("  1. Run: python sprint_b_phase4_semantic_matching.py")
    print("  2. This will create the fast semantic matching service")
    print()


if __name__ == "__main__":
    main()
