"""
SPRINT B - PHASE 1 (NO PGVECTOR): Database Schema for Embeddings Cache
=======================================================================
Uses JSONB for embeddings instead of pgvector extension
Slightly slower but works without pgvector installation
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from app.db.session import SessionLocal
from sqlalchemy import text

def create_embeddings_cache_no_pgvector():
    """Create embeddings cache table using JSONB (no pgvector needed)"""
    
    print("🗄️  SPRINT B - PHASE 1 (NO PGVECTOR): Database Schema")
    print("=" * 60)
    print("⚡ Using JSONB for embeddings (works without pgvector)")
    
    db = SessionLocal()
    
    try:
        # Create embeddings_cache table with JSONB
        print("\n1️⃣  Creating embeddings_cache table...")
        
        create_table_sql = text("""
            CREATE TABLE IF NOT EXISTS embeddings_cache (
                id SERIAL PRIMARY KEY,
                entity_id VARCHAR(255) NOT NULL,
                entity_type VARCHAR(50) NOT NULL,
                skills_normalized TEXT[],
                embedding JSONB,
                computed_at TIMESTAMP DEFAULT NOW(),
                CONSTRAINT unique_entity UNIQUE(entity_id, entity_type)
            );
        """)
        
        db.execute(create_table_sql)
        db.commit()
        print("   ✅ embeddings_cache table created (using JSONB)")
        
        # Create indexes
        print("\n2️⃣  Creating indexes...")
        
        # Regular index for lookups
        index1_sql = text("""
            CREATE INDEX IF NOT EXISTS idx_embeddings_entity 
            ON embeddings_cache(entity_id, entity_type);
        """)
        db.execute(index1_sql)
        print("   ✅ Entity lookup index created")
        
        # GIN index for JSONB (helps with queries)
        index2_sql = text("""
            CREATE INDEX IF NOT EXISTS idx_embeddings_jsonb 
            ON embeddings_cache USING gin(embedding);
        """)
        db.execute(index2_sql)
        print("   ✅ JSONB index created")
        
        db.commit()
        
        # Verify
        print("\n3️⃣  Verifying table...")
        result = db.execute(text("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'embeddings_cache'
            ORDER BY ordinal_position;
        """))
        
        columns = result.fetchall()
        if columns:
            print("   ✅ Table structure:")
            for col_name, col_type in columns:
                print(f"      - {col_name}: {col_type}")
        
        # Test insert
        print("\n4️⃣  Testing table...")
        import json
        import numpy as np
        
        test_vector = np.random.rand(384).tolist()
        test_vector_json = json.dumps(test_vector)
        
        test_sql = text("""
            INSERT INTO embeddings_cache 
            (entity_id, entity_type, skills_normalized, embedding)
            VALUES 
            ('TEST_001', 'cv', ARRAY['python', 'sql'], :embedding::jsonb)
            ON CONFLICT (entity_id, entity_type) DO UPDATE
            SET embedding = EXCLUDED.embedding;
        """)
        
        db.execute(test_sql, {'embedding': test_vector_json})
        db.commit()
        print("   ✅ Test record inserted")
        
        # Verify test record
        verify_sql = text("""
            SELECT entity_id, entity_type, skills_normalized,
                   jsonb_array_length(embedding) as dims
            FROM embeddings_cache
            WHERE entity_id = 'TEST_001';
        """)
        result = db.execute(verify_sql)
        row = result.fetchone()
        if row:
            print(f"   ✅ Test record verified: {row.entity_id}, dims={row.dims}")
        
        # Clean up test record
        db.execute(text("DELETE FROM embeddings_cache WHERE entity_id = 'TEST_001';"))
        db.commit()
        print("   ✅ Test record cleaned up")
        
        print("\n" + "=" * 60)
        print("✅ PHASE 1 COMPLETE!")
        print("=" * 60)
        print("\n📊 Summary:")
        print("   ✅ embeddings_cache table created (JSONB)")
        print("   ✅ Indexes created")
        print("   ✅ Table tested and verified")
        print("\n⚡ Note: Using JSONB instead of vector type")
        print("   • Works without pgvector extension")
        print("   • Slightly slower similarity search")
        print("   • Still fast enough for production")
        print("\n📋 Next: PHASE 2 - Embedding Service")
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ Error: {e}")
        raise
    
    finally:
        db.close()

if __name__ == "__main__":
    create_embeddings_cache_no_pgvector()
