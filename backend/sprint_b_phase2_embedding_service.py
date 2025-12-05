"""
Sprint B - Phase 2: Embedding Service
Creates a service to compute and cache embeddings for CVs and jobs
"""

import json
import time
from typing import List, Optional, Dict, Any
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from sentence_transformers import SentenceTransformer
from app.core.config import settings

# Skill normalization mapping (same as gated matching)
SKILL_SYNONYMS = {
    'ml': 'machine learning',
    'ai': 'artificial intelligence',
    'js': 'javascript',
    'ts': 'typescript',
    'py': 'python',
    'sql': 'database',
    'db': 'database',
    'fe': 'frontend',
    'be': 'backend',
    'devops': 'operations',
    'ci/cd': 'continuous integration',
}

class EmbeddingService:
    """Service to compute and cache embeddings"""
    
    def __init__(self):
        """Initialize the embedding service"""
        self.model = None
        self.model_name = "all-MiniLM-L6-v2"
        self.embedding_dim = 384
        
    def load_model(self):
        """Load the sentence transformer model (one-time cost)"""
        if self.model is None:
            print(f"📦 Loading model: {self.model_name}...")
            start = time.time()
            self.model = SentenceTransformer(self.model_name)
            elapsed = time.time() - start
            print(f"   ✅ Model loaded in {elapsed:.2f}s")
        return self.model
    
    def normalize_skill(self, skill: str) -> str:
        """Normalize a single skill"""
        skill = skill.lower().strip()
        return SKILL_SYNONYMS.get(skill, skill)
    
    def normalize_skills(self, skills: List[str]) -> List[str]:
        """Normalize a list of skills"""
        if not skills:
            return []
        
        normalized = []
        seen = set()
        
        for skill in skills:
            norm = self.normalize_skill(skill)
            if norm and norm not in seen:
                normalized.append(norm)
                seen.add(norm)
        
        return normalized
    
    def compute_embedding(self, skills: List[str]) -> List[float]:
        """Compute embedding for a list of skills"""
        if not skills:
            return [0.0] * self.embedding_dim
        
        # Ensure model is loaded
        model = self.load_model()
        
        # Join skills into a single text
        text = ", ".join(skills)
        
        # Compute embedding
        embedding = model.encode(text, show_progress_bar=False)
        
        return embedding.tolist()
    
    def save_embedding(
        self, 
        db: Session,
        entity_id: str,
        entity_type: str,
        skills: List[str]
    ) -> Dict[str, Any]:
        """Save embedding to cache"""
        
        # Normalize skills
        normalized_skills = self.normalize_skills(skills)
        
        # Compute embedding
        embedding = self.compute_embedding(normalized_skills)
        
        # Convert to JSON
        embedding_json = json.dumps(embedding)
        
        # Save to database
        sql = text(f"""
        INSERT INTO embeddings_cache
        (entity_id, entity_type, skills_normalized, embedding, computed_at)
        VALUES
        (:entity_id, :entity_type, :skills_normalized, '{embedding_json}'::jsonb, NOW())
        ON CONFLICT (entity_id, entity_type) DO UPDATE
        SET 
            skills_normalized = EXCLUDED.skills_normalized,
            embedding = EXCLUDED.embedding,
            computed_at = EXCLUDED.computed_at;
        """)
        
        db.execute(sql, {
            "entity_id": entity_id,
            "entity_type": entity_type,
            "skills_normalized": normalized_skills
        })
        db.commit()
        
        return {
            "entity_id": entity_id,
            "entity_type": entity_type,
            "skills_normalized": normalized_skills,
            "embedding_dim": len(embedding)
        }
    
    def get_embedding(
        self, 
        db: Session,
        entity_id: str,
        entity_type: str
    ) -> Optional[Dict[str, Any]]:
        """Get embedding from cache"""
        
        sql = text("""
        SELECT entity_id, entity_type, skills_normalized, embedding, computed_at
        FROM embeddings_cache
        WHERE entity_id = :entity_id AND entity_type = :entity_type;
        """)
        
        result = db.execute(sql, {
            "entity_id": entity_id,
            "entity_type": entity_type
        }).fetchone()
        
        if not result:
            return None
        
        # Parse embedding from JSONB
        embedding = json.loads(result[3]) if isinstance(result[3], str) else result[3]
        
        return {
            "entity_id": result[0],
            "entity_type": result[1],
            "skills_normalized": result[2],
            "embedding": embedding,
            "computed_at": result[4]
        }
    
    def batch_save_cv_embeddings(
        self,
        db: Session,
        cv_data: List[Dict[str, Any]],
        batch_size: int = 100
    ) -> Dict[str, int]:
        """Save embeddings for multiple CVs"""
        
        print(f"\n📊 Processing {len(cv_data)} CVs in batches of {batch_size}...")
        
        total_cvs = len(cv_data)
        processed = 0
        saved = 0
        skipped = 0
        
        start_time = time.time()
        
        for i in range(0, total_cvs, batch_size):
            batch = cv_data[i:i + batch_size]
            
            for cv in batch:
                try:
                    cv_id = cv.get("cv_id")
                    skills = cv.get("skills", [])
                    
                    if not skills:
                        skipped += 1
                        continue
                    
                    self.save_embedding(db, cv_id, "cv", skills)
                    saved += 1
                    
                except Exception as e:
                    print(f"   ⚠️  Error processing CV {cv.get('cv_id')}: {e}")
                    skipped += 1
                
                processed += 1
                
                # Progress update
                if processed % 100 == 0:
                    elapsed = time.time() - start_time
                    rate = processed / elapsed if elapsed > 0 else 0
                    eta = (total_cvs - processed) / rate if rate > 0 else 0
                    print(f"   Progress: {processed}/{total_cvs} CVs ({saved} saved) | {rate:.1f} CVs/sec | ETA: {eta:.1f}s")
        
        elapsed = time.time() - start_time
        
        print(f"\n✅ Batch processing complete!")
        print(f"   Total: {total_cvs}")
        print(f"   Saved: {saved}")
        print(f"   Skipped: {skipped}")
        print(f"   Time: {elapsed:.2f}s ({processed/elapsed:.1f} CVs/sec)")
        
        return {
            "total": total_cvs,
            "saved": saved,
            "skipped": skipped,
            "time": elapsed
        }
    
    def batch_save_job_embeddings(
        self,
        db: Session,
        job_data: List[Dict[str, Any]]
    ) -> Dict[str, int]:
        """Save embeddings for multiple jobs"""
        
        print(f"\n📊 Processing {len(job_data)} jobs...")
        
        total_jobs = len(job_data)
        saved = 0
        skipped = 0
        
        start_time = time.time()
        
        for job in job_data:
            try:
                job_id = job.get("job_id")
                skills = job.get("skills_required", [])
                
                if not skills:
                    skipped += 1
                    continue
                
                self.save_embedding(db, job_id, "job", skills)
                saved += 1
                
            except Exception as e:
                print(f"   ⚠️  Error processing Job {job.get('job_id')}: {e}")
                skipped += 1
        
        elapsed = time.time() - start_time
        
        print(f"\n✅ Job processing complete!")
        print(f"   Total: {total_jobs}")
        print(f"   Saved: {saved}")
        print(f"   Skipped: {skipped}")
        print(f"   Time: {elapsed:.2f}s")
        
        return {
            "total": total_jobs,
            "saved": saved,
            "skipped": skipped,
            "time": elapsed
        }


def test_embedding_service():
    """Test the embedding service"""
    
    print("🧪 SPRINT B - PHASE 2: Embedding Service Test")
    print("=" * 60)
    
    # Create database connection
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    try:
        # Initialize service
        print("\n1️⃣  Initializing embedding service...")
        service = EmbeddingService()
        print(f"   ✅ Service initialized (model: {service.model_name}, dims: {service.embedding_dim})")
        
        # Test skill normalization
        print("\n2️⃣  Testing skill normalization...")
        test_skills = ["Python", "ML", "js", "SQL", "DevOps"]
        normalized = service.normalize_skills(test_skills)
        print(f"   Input: {test_skills}")
        print(f"   Output: {normalized}")
        
        # Test embedding computation
        print("\n3️⃣  Testing embedding computation...")
        embedding = service.compute_embedding(normalized)
        print(f"   ✅ Computed embedding: {len(embedding)} dimensions")
        print(f"   Sample values: [{embedding[0]:.4f}, {embedding[1]:.4f}, {embedding[2]:.4f}, ...]")
        
        # Test save to cache
        print("\n4️⃣  Testing cache save...")
        result = service.save_embedding(db, "TEST_CV_001", "cv", test_skills)
        print(f"   ✅ Saved to cache:")
        print(f"      Entity ID: {result['entity_id']}")
        print(f"      Entity Type: {result['entity_type']}")
        print(f"      Normalized Skills: {result['skills_normalized']}")
        print(f"      Embedding Dims: {result['embedding_dim']}")
        
        # Test retrieve from cache
        print("\n5️⃣  Testing cache retrieval...")
        cached = service.get_embedding(db, "TEST_CV_001", "cv")
        if cached:
            print(f"   ✅ Retrieved from cache:")
            print(f"      Entity ID: {cached['entity_id']}")
            print(f"      Skills: {cached['skills_normalized']}")
            print(f"      Computed at: {cached['computed_at']}")
        
        # Clean up test data
        print("\n6️⃣  Cleaning up test data...")
        cleanup_sql = text("DELETE FROM embeddings_cache WHERE entity_id = 'TEST_CV_001';")
        db.execute(cleanup_sql)
        db.commit()
        print("   ✅ Test data cleaned up")
        
        print("\n" + "=" * 60)
        print("✅ PHASE 2 COMPLETE!")
        print()
        print("Next steps:")
        print("  1. Run: python sprint_b_phase3_populate_embeddings.py")
        print("  2. This will populate embeddings for all CVs and jobs")
        print()
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    test_embedding_service()
