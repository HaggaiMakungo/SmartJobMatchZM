# Database Migration Guide - CAMSS 2.0 Matching System

## 📋 Overview

This migration creates 8 new tables in a separate `matching_metadata` schema for the job-candidate matching system. These tables support Phase 2A (MVP) of the CAMSS 2.0 algorithm.

## 🗂️ Tables Created

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `skills_taxonomy` | Normalized skill names + synonyms | 500+ skills from resume analysis |
| `skill_similarity` | Skill co-occurrence patterns | Context-aware skill matching |
| `category_compatibility` | Industry transition probabilities | Data-driven category scoring |
| `certifications` | Professional certifications | Weighted relevance scoring |
| `user_job_interactions` | User behavior tracking | Complete interaction history |
| `match_feedback` | User match ratings | Binary helpful/not helpful |
| `collar_weights_config` | Configurable algorithm weights | A/B testing support |
| `match_explanations` | Match reasoning data | Explainability for users |

## 🚀 Running the Migration

### Method 1: PostgreSQL Command Line

```bash
# Connect to your database
psql -U your_username -d ai_job_matching

# Run the migration
\i C:/Dev/ai-job-matchingV2/backend/migrations/001_create_matching_tables.sql

# Verify tables were created
\dt matching_metadata.*
```

### Method 2: pgAdmin

1. Open pgAdmin
2. Connect to your `ai_job_matching` database
3. Open Query Tool (Tools → Query Tool)
4. File → Open → Select `001_create_matching_tables.sql`
5. Execute (F5 or click Execute button)
6. Check Messages tab for success confirmation

### Method 3: Python Script

```python
import psycopg2
from pathlib import Path

# Read migration file
migration_sql = Path('migrations/001_create_matching_tables.sql').read_text()

# Connect and execute
conn = psycopg2.connect(
    host="localhost",
    database="ai_job_matching",
    user="your_username",
    password="your_password"
)

with conn.cursor() as cur:
    cur.execute(migration_sql)
    conn.commit()
    print("✓ Migration successful!")

conn.close()
```

## 📊 Post-Migration Verification

Run these queries to verify success:

```sql
-- Check all tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'matching_metadata'
ORDER BY table_name;

-- Should return 8 tables:
-- 1. category_compatibility
-- 2. certifications
-- 3. collar_weights_config
-- 4. match_explanations
-- 5. match_feedback
-- 6. skill_similarity
-- 7. skills_taxonomy
-- 8. user_job_interactions

-- Check collar weights were seeded
SELECT * FROM matching_metadata.collar_weights_config;

-- Should show 5 rows (white, blue, pink, grey, green) with equal weights (0.17 each)
```

## 🔄 Rolling Back

If you need to remove all matching tables:

```bash
psql -U your_username -d ai_job_matching -f migrations/001_rollback_matching_tables.sql
```

⚠️ **WARNING:** This will permanently delete all matching data!

## 📥 Next Steps: Seeding Data

After migration, seed the tables with data from your analysis:

### 1. Seed Skills Taxonomy

```python
# Load from analyze_datasets.py output
import json
import psycopg2

conn = psycopg2.connect(...)
cur = conn.cursor()

with open('datasets/skills_taxonomy.json') as f:
    skills = json.load(f)
    
for skill in skills:
    cur.execute("""
        INSERT INTO matching_metadata.skills_taxonomy 
            (skill_name, canonical_name, category, frequency)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (skill_name) DO NOTHING
    """, (
        skill['skill'], 
        skill['skill'],  # Same for now, update later if needed
        'general',  # Categorize later
        skill['frequency']
    ))

conn.commit()
```

### 2. Seed Skill Similarity

```python
with open('datasets/skill_co_occurrence.json') as f:
    pairs = json.load(f)

for pair in pairs:
    # Get skill IDs
    cur.execute("SELECT id FROM matching_metadata.skills_taxonomy WHERE skill_name = %s", (pair['skill_a'],))
    skill_a_id = cur.fetchone()[0]
    
    cur.execute("SELECT id FROM matching_metadata.skills_taxonomy WHERE skill_name = %s", (pair['skill_b'],))
    skill_b_id = cur.fetchone()[0]
    
    # Insert similarity
    cur.execute("""
        INSERT INTO matching_metadata.skill_similarity 
            (skill_a_id, skill_b_id, co_occurrence_count, jaccard_similarity, confidence_score)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (skill_a_id, skill_b_id) DO NOTHING
    """, (
        skill_a_id,
        skill_b_id,
        pair['co_occurrences'],
        pair['jaccard_similarity'],
        0.8  # Default confidence
    ))

conn.commit()
```

### 3. Seed Category Compatibility

```python
with open('datasets/industry_transitions.json') as f:
    transitions = json.load(f)

for trans in transitions:
    cur.execute("""
        INSERT INTO matching_metadata.category_compatibility 
            (from_category, to_category, transition_count, transition_probability, compatibility_score, sample_size)
        VALUES (%s, %s, %s, %s, %s, %s)
        ON CONFLICT (from_category, to_category) DO NOTHING
    """, (
        trans['from_industry'],
        trans['to_industry'],
        trans['transitions'],
        trans['probability'],
        trans['probability'],  # Use probability as initial compatibility score
        trans['transitions']
    ))

conn.commit()
```

## 🧪 Testing the Schema

Test queries to ensure everything works:

```sql
-- Test 1: Skills lookup
SELECT skill_name, frequency 
FROM matching_metadata.skills_taxonomy 
ORDER BY frequency DESC 
LIMIT 10;

-- Test 2: Skill co-occurrence
SELECT 
    st1.skill_name as skill_a,
    st2.skill_name as skill_b,
    ss.jaccard_similarity
FROM matching_metadata.skill_similarity ss
JOIN matching_metadata.skills_taxonomy st1 ON ss.skill_a_id = st1.id
JOIN matching_metadata.skills_taxonomy st2 ON ss.skill_b_id = st2.id
ORDER BY ss.jaccard_similarity DESC
LIMIT 10;

-- Test 3: Category transitions
SELECT 
    from_category,
    to_category,
    transition_probability
FROM matching_metadata.category_compatibility
ORDER BY transition_probability DESC
LIMIT 10;

-- Test 4: Weight configuration
SELECT 
    collar_type,
    weight_qualification,
    weight_experience,
    weight_skills,
    (weight_qualification + weight_experience + weight_skills + 
     weight_location + weight_category + weight_personalization) as total
FROM matching_metadata.collar_weights_config;
```

## 📝 Schema Design Notes

### Why Separate Schema?

Using `matching_metadata` schema keeps matching system tables isolated from your main application tables. Benefits:
- Clear separation of concerns
- Easier to manage permissions
- Can be backed up/restored independently
- No naming conflicts with existing tables

### Foreign Key Relationships

The schema uses:
- `user_id UUID` references your CVs table (adjust if needed)
- `job_id VARCHAR(50)` supports both corp_jobs and small_jobs
- Internal FK between `user_job_interactions` and `match_feedback`

### Indexing Strategy

Indexes optimized for:
- Fast skill lookups (canonical_name, category)
- Efficient similarity searches (scores DESC)
- Quick interaction queries (user_id, timestamp)
- Feedback analysis (helpful, reason)

### JSONB Columns

Used for flexible data storage:
- `sub_scores`: Match component breakdown
- `explanation_data`: Structured reasoning
- `industry_relevance`: Dynamic arrays

## 🔧 Troubleshooting

### Error: "schema matching_metadata already exists"

```sql
-- Check existing tables
\dt matching_metadata.*

-- If empty or old, drop and recreate
DROP SCHEMA matching_metadata CASCADE;
-- Then re-run migration
```

### Error: "permission denied for schema"

```sql
-- Grant permissions
GRANT USAGE ON SCHEMA matching_metadata TO your_app_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA matching_metadata TO your_app_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA matching_metadata TO your_app_user;
```

### Error: "constraint weights_sum_check violated"

The weights must sum to exactly 1.00. If modifying weights:

```sql
UPDATE matching_metadata.collar_weights_config
SET 
    weight_qualification = 0.30,
    weight_experience = 0.25,
    weight_skills = 0.25,
    weight_location = 0.05,
    weight_category = 0.10,
    weight_personalization = 0.05
WHERE collar_type = 'white';
-- Sum = 1.00 ✓
```

## 📊 Performance Considerations

For production use:

1. **Add partitioning** for `user_job_interactions` by timestamp
2. **Archive old data** older than 6 months
3. **Materialized views** for expensive aggregate queries
4. **Connection pooling** (use pgBouncer or similar)
5. **Regular VACUUM** to maintain performance

## 🔐 Security Recommendations

1. Create a dedicated database user for matching service
2. Grant only necessary permissions
3. Use prepared statements (parameterized queries)
4. Enable SSL for database connections
5. Regular backups of matching_metadata schema

## 📅 Migration History

| Version | Date | Description |
|---------|------|-------------|
| 001 | 2024-11-11 | Initial matching system tables |

## 🆘 Support

If you encounter issues:
1. Check PostgreSQL logs: `tail -f /var/log/postgresql/postgresql-*.log`
2. Verify database connection settings
3. Ensure PostgreSQL version is 12+
4. Check disk space for database
5. Review this document's troubleshooting section

---

**Ready for Week 1!** After running this migration and seeding data, you can start building the matching engine. 🚀
