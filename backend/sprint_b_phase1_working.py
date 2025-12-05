"""
Sprint B - Phase 1: Database Schema (No pgvector)
Creates embeddings_cache table using JSONB instead of vector type
"""

import sys
import json
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

def create_embeddings_cache_no_pgvector():
    """Create embeddings cache table without pgvector dependency"""
    
    print("🗄️  SPRINT B - PHASE 1 (NO PGVECTOR): Database Schema")
    print("=" * 60)
    print("⚡ Using JSONB for embeddings (works without pgvector)\n")
    
    # Create database connection
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    try:
        # 1. Create embeddings_cache table
        print("1️⃣  Creating embeddings_cache table...")
        
        create_table_sql = text("""
        CREATE TABLE IF NOT EXISTS embeddings_cache (
            id SERIAL PRIMARY KEY,
            entity_id VARCHAR NOT NULL,
            entity_type VARCHAR NOT NULL,
            skills_normalized TEXT[],
            embedding JSONB,
            computed_at TIMESTAMP DEFAULT NOW(),
            UNIQUE(entity_id, entity_type)
        );
        """)
        
        db.execute(create_table_sql)
        db.commit()
        print("   ✅ embeddings_cache table created (using JSONB)\n")
        
        # 2. Create indexes
        print("2️⃣  Creating indexes...")
        
        # Index for entity lookup
        idx1_sql = text("""
        CREATE INDEX IF NOT EXISTS idx_embeddings_entity 
        ON embeddings_cache(entity_id, entity_type);
        """)
        db.execute(idx1_sql)
        
        # Index for JSONB (helps with GIN index)
        idx2_sql = text("""
        CREATE INDEX IF NOT EXISTS idx_embeddings_jsonb 
        ON embeddings_cache USING gin(embedding);
        """)
        db.execute(idx2_sql)
        
        db.commit()
        print("   ✅ Entity lookup index created")
        print("   ✅ JSONB index created\n")
        
        # 3. Verify table structure
        print("3️⃣  Verifying table...")
        
        verify_sql = text("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'embeddings_cache'
        ORDER BY ordinal_position;
        """)
        
        result = db.execute(verify_sql)
        print("   ✅ Table structure:")
        for row in result:
            print(f"      - {row[0]}: {row[1]}")
        print()
        
        # 4. Test insert
        print("4️⃣  Testing table...")
        
        # Create test embedding (384 dims)
        test_vector = [0.1] * 384
        test_vector_json = json.dumps(test_vector)
        
        # REAL FIX: Direct string formatting instead of bind parameter
        test_sql = text(f"""
        INSERT INTO embeddings_cache
        (entity_id, entity_type, skills_normalized, embedding)
        VALUES
        ('TEST_001', 'cv', ARRAY['python', 'sql'], '{test_vector_json}'::jsonb)
        ON CONFLICT (entity_id, entity_type) DO UPDATE
        SET embedding = EXCLUDED.embedding;
        """)
        
        db.execute(test_sql)
        db.commit()
        print("   ✅ Test record inserted")
        
        # Verify test record
        verify_test_sql = text("""
        SELECT entity_id, jsonb_array_length(embedding) as dims
        FROM embeddings_cache 
        WHERE entity_id = 'TEST_001';
        """)
        
        result = db.execute(verify_test_sql)
        row = result.fetchone()
        if row:
            print(f"   ✅ Test record verified: {row[0]}, dims={row[1]}")
        
        # Clean up test record
        cleanup_sql = text("""
        DELETE FROM embeddings_cache WHERE entity_id = 'TEST_001';
        """)
        db.execute(cleanup_sql)
        db.commit()
        print("   ✅ Test record cleaned up\n")
        
        print("=" * 60)
        print("✅ PHASE 1 COMPLETE!")
        print()
        print("📊 Database ready for embeddings!")
        print()
        print("Next steps:")
        print("  1. Run: python sprint_b_phase2_embedding_service.py")
        print("  2. This will create the embedding computation service")
        print()
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_embeddings_cache_no_pgvector()
