"""
Diagnostic: Check why semantic matching found so few matches
"""

import json
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

def diagnose_matching_issue():
    """Diagnose the matching issue"""
    
    print("🔍 DIAGNOSTIC: Semantic Matching Issue")
    print("=" * 60)
    
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    try:
        # Get the test job details
        print("\n1️⃣  Checking job skills...")
        job_sql = text("""
        SELECT 
            j.job_id, 
            j.title,
            j.required_skills,
            j.preferred_skills,
            e.skills_normalized,
            e.embedding
        FROM corporate_jobs j
        JOIN embeddings_cache e ON e.entity_id = j.job_id
        WHERE j.job_id = 'JOB000070';
        """)
        
        job = db.execute(job_sql).fetchone()
        
        if job:
            print(f"   Job: {job[1]}")
            print(f"   Required skills (raw): {job[2]}")
            print(f"   Preferred skills (raw): {job[3]}")
            print(f"   Normalized skills: {job[4]}")
            print(f"   Embedding dims: {len(json.loads(job[5]) if isinstance(job[5], str) else job[5])}")
        
        # Check sample CVs
        print("\n2️⃣  Checking sample CV skills...")
        cv_sql = text("""
        SELECT 
            c.cv_id,
            c.full_name,
            c.skills_technical,
            c.skills_soft,
            e.skills_normalized,
            e.embedding
        FROM cvs c
        JOIN embeddings_cache e ON e.entity_id = c.cv_id
        WHERE c.skills_technical ILIKE '%photo%'
           OR c.skills_technical ILIKE '%creative%'
           OR c.skills_technical ILIKE '%media%'
        LIMIT 5;
        """)
        
        cvs = db.execute(cv_sql).fetchall()
        
        print(f"   Found {len(cvs)} CVs with photo/creative/media skills")
        
        for cv in cvs[:3]:
            print(f"\n   CV: {cv[1]}")
            print(f"   Technical skills (raw): {cv[2][:100]}...")
            print(f"   Soft skills (raw): {cv[3][:100] if cv[3] else 'None'}...")
            print(f"   Normalized skills: {cv[4][:10]}...")  # First 10 skills
        
        # Check skill overlap
        print("\n3️⃣  Checking skill overlap issue...")
        
        job_skills_normalized = job[4] if job else []
        print(f"   Job normalized skills: {job_skills_normalized}")
        
        if cvs:
            cv_skills_normalized = cvs[0][4]
            print(f"   Sample CV normalized skills: {cv_skills_normalized[:10]}...")
            
            # Check intersection
            job_set = set(job_skills_normalized)
            cv_set = set(cv_skills_normalized)
            intersection = job_set & cv_set
            
            print(f"\n   Job skills (set): {job_set}")
            print(f"   CV skills (first 10): {list(cv_set)[:10]}")
            print(f"   Intersection: {intersection}")
            
            if not intersection:
                print("\n   ⚠️  PROBLEM FOUND: No exact skill matches!")
                print("   This is why Gate 3 (matched_skills check) filters everything out.")
                print("\n   SOLUTION: Remove Gate 3 or make it less strict.")
        
        # Check all CVs with embeddings
        print("\n4️⃣  Checking all CV embeddings...")
        count_sql = text("""
        SELECT COUNT(*) FROM embeddings_cache WHERE entity_type = 'cv';
        """)
        cv_count = db.execute(count_sql).scalar()
        print(f"   Total CVs with embeddings: {cv_count}")
        
        # Sample embedding similarity
        print("\n5️⃣  Testing raw similarity (without gates)...")
        
        if job and cvs:
            import numpy as np
            
            job_embedding = json.loads(job[5]) if isinstance(job[5], str) else job[5]
            
            for cv in cvs[:3]:
                cv_embedding = json.loads(cv[5]) if isinstance(cv[5], str) else cv[5]
                
                # Compute similarity
                a_np = np.array(job_embedding)
                b_np = np.array(cv_embedding)
                dot_product = np.dot(a_np, b_np)
                norm_a = np.linalg.norm(a_np)
                norm_b = np.linalg.norm(b_np)
                similarity = dot_product / (norm_a * norm_b) if norm_a and norm_b else 0
                
                print(f"   {cv[1]}: Similarity = {similarity:.4f} ({similarity*100:.2f}%)")
        
        print("\n" + "=" * 60)
        print("✅ DIAGNOSTIC COMPLETE")
        print()
        print("🔧 Recommendations:")
        print("   1. Remove Gate 3 (matched_skills check) - too strict!")
        print("   2. Use only semantic similarity scores")
        print("   3. Let min_score threshold do the filtering")
        print()
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    diagnose_matching_issue()
