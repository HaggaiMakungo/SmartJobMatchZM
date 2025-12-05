"""
SPRINT B - PHASE 1: Database Schema for Embeddings Cache
=========================================================
Creates embeddings_cache table for storing precomputed semantic embeddings
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from app.db.session import SessionLocal, engine
from sqlalchemy import text

def create_embeddings_cache():
    """Create embeddings cache table with pgvector support"""
    
    print("🗄️  SPRINT B - PHASE 1: Database Schema")
    print("=" * 60)
    
    db = SessionLocal()
    
    try:
        # Step 1: Enable pgvector extension
        print("\n1️⃣  Enabling pgvector extension...")
        try:
            db.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
            db.commit()
            print("   ✅ pgvector extension enabled")
        except Exception as e:
            print(f"   ⚠️  Warning: {e}")
            print("   ⚠️  If pgvector is not installed, install it first:")
            print("   ⚠️  See: https://github.com/pgvector/pgvector")
        
        # Step 2: Create embeddings_cache table
        print("\n2️⃣  Creating embeddings_cache table...")
        
        create_table_sql = text("""
            CREATE TABLE IF NOT EXISTS embeddings_cache (
                id SERIAL PRIMARY KEY,
                entity_id VARCHAR(255) NOT NULL,
                entity_type VARCHAR(50) NOT NULL,
                skills_normalized TEXT[],
                embedding vector(384),
                computed_at TIMESTAMP DEFAULT NOW(),
                CONSTRAINT unique_entity UNIQUE(entity_id, entity_type)
            );
        """)
        
        db.execute(create_table_sql)
        db.commit()
        print("   ✅ embeddings_cache table created")
        
        # Step 3: Create indexes
        print("\n3️⃣  Creating indexes...")
        
        # Regular index for lookups
        index1_sql = text("""
            CREATE INDEX IF NOT EXISTS idx_embeddings_entity 
            ON embeddings_cache(entity_id, entity_type);
        """)
        db.execute(index1_sql)
        print("   ✅ Entity lookup index created")
        
        # Vector index for similarity search (IVFFlat)
        print("   ⏳ Creating vector index (this may take a minute)...")
        try:
            index2_sql = text("""
                CREATE INDEX IF NOT EXISTS idx_embeddings_vector 
                ON embeddings_cache USING ivfflat (embedding vector_cosine_ops)
                WITH (lists = 100);
            """)
            db.execute(index2_sql)
            print("   ✅ Vector similarity index created")
        except Exception as e:
            print(f"   ⚠️  Vector index not created: {e}")
            print("   ⚠️  Queries will still work but may be slower")
        
        db.commit()
        
        # Step 4: Verify
        print("\n4️⃣  Verifying table...")
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
        
        # Step 5: Test insert
        print("\n5️⃣  Testing table...")
        test_sql = text("""
            INSERT INTO embeddings_cache 
            (entity_id, entity_type, skills_normalized, embedding)
            VALUES 
            ('TEST_001', 'cv', ARRAY['python', 'sql'], 
             ARRAY[0.1, 0.2, 0.3]::vector(384))
            ON CONFLICT (entity_id, entity_type) DO NOTHING;
        """)
        
        # Create a proper 384-dimensional vector
        import numpy as np
        test_vector = np.random.rand(384).tolist()
        test_vector_str = '[' + ','.join(map(str, test_vector)) + ']'
        
        test_sql = text(f"""
            INSERT INTO embeddings_cache 
            (entity_id, entity_type, skills_normalized, embedding)
            VALUES 
            ('TEST_001', 'cv', ARRAY['python', 'sql'], 
             '{test_vector_str}'::vector(384))
            ON CONFLICT (entity_id, entity_type) DO UPDATE
            SET embedding = EXCLUDED.embedding;
        """)
        
        db.execute(test_sql)
        db.commit()
        print("   ✅ Test record inserted")
        
        # Verify test record
        verify_sql = text("""
            SELECT entity_id, entity_type, skills_normalized,
                   vector_dims(embedding) as dims
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
        print("   ✅ pgvector extension enabled")
        print("   ✅ embeddings_cache table created")
        print("   ✅ Indexes created")
        print("   ✅ Table tested and verified")
        print("\n📋 Next: PHASE 2 - Embedding Service")
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ Error: {e}")
        print("\n🔧 Troubleshooting:")
        print("   1. Make sure PostgreSQL is running")
        print("   2. Make sure pgvector extension is installed")
        print("   3. Check database connection settings")
        raise
    
    finally:
        db.close()

if __name__ == "__main__":
    create_embeddings_cache()
