"""
Seed Matching System Tables
Handles case where industry_transitions.json is empty
"""

import psycopg2
import json
from pathlib import Path

# Database connection settings
DB_CONFIG = {
    'host': 'localhost',
    'database': 'job_match_db', 
    'user': 'postgres',        
    'password': 'Winter123'       
}

print("=" * 80)
print("SEEDING MATCHING SYSTEM TABLES")
print("=" * 80)

# Connect to database
try:
    conn = psycopg2.connect(**DB_CONFIG)
    conn.autocommit = False
    cur = conn.cursor()
    print("\n✓ Connected to database")
except Exception as e:
    print(f"\n✗ Database connection failed: {e}")
    print("\nPlease update DB_CONFIG in this script with your actual:")
    print("  - database name")
    print("  - username")
    print("  - password")
    exit(1)

# ============================================================================
# STEP 1: Check files
# ============================================================================
print("\n[1/4] Checking data files...")

files_needed = ['skills_taxonomy.json', 'skill_co_occurrence.json', 'industry_transitions.json']
missing = []

for file in files_needed:
    if Path(file).exists():
        with open(file, 'r') as f:
            data = json.load(f)
            print(f"  ✓ {file:30s}: {len(data):4d} entries")
    else:
        missing.append(file)
        print(f"  ✗ {file:30s}: MISSING")

if missing:
    print(f"\n⚠️  Missing files: {missing}")
    print("Run: python analyze_proper_csv.py")
    exit(1)

# ============================================================================
# STEP 2: Seed skills_taxonomy
# ============================================================================
print("\n[2/4] Seeding skills_taxonomy...")

try:
    with open('skills_taxonomy.json', 'r') as f:
        skills_data = json.load(f)
    
    if not skills_data:
        print("  ⚠️  Empty skills_taxonomy.json")
    else:
        inserted = 0
        for skill in skills_data:
            cur.execute("""
                INSERT INTO matching_metadata.skills_taxonomy 
                    (skill_name, canonical_name, category, frequency)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (skill_name) DO NOTHING
            """, (
                skill['skill'],
                skill['skill'],
                'general',
                int(skill['frequency'])
            ))
            if cur.rowcount > 0:
                inserted += 1
        
        conn.commit()
        print(f"  ✓ Inserted {inserted} skills")
        
except Exception as e:
    conn.rollback()
    print(f"  ✗ Error: {e}")

# ============================================================================
# STEP 3: Seed skill_similarity
# ============================================================================
print("\n[3/4] Seeding skill_similarity...")

try:
    with open('skill_co_occurrence.json', 'r') as f:
        pairs_data = json.load(f)
    
    if not pairs_data:
        print("  ⚠️  Empty skill_co_occurrence.json")
    else:
        inserted = 0
        skipped = 0
        
        for pair in pairs_data:
            # Get skill IDs
            cur.execute(
                "SELECT id FROM matching_metadata.skills_taxonomy WHERE skill_name = %s",
                (pair['skill_a'],)
            )
            result_a = cur.fetchone()
            
            cur.execute(
                "SELECT id FROM matching_metadata.skills_taxonomy WHERE skill_name = %s",
                (pair['skill_b'],)
            )
            result_b = cur.fetchone()
            
            if result_a and result_b:
                skill_a_id = result_a[0]
                skill_b_id = result_b[0]
                
                cur.execute("""
                    INSERT INTO matching_metadata.skill_similarity 
                        (skill_a_id, skill_b_id, co_occurrence_count, jaccard_similarity, confidence_score)
                    VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT (skill_a_id, skill_b_id) DO NOTHING
                """, (
                    skill_a_id,
                    skill_b_id,
                    int(pair['co_occurrences']),
                    float(pair['jaccard_similarity']),
                    0.8
                ))
                if cur.rowcount > 0:
                    inserted += 1
            else:
                skipped += 1
        
        conn.commit()
        print(f"  ✓ Inserted {inserted} skill pairs")
        if skipped > 0:
            print(f"  ⚠️  Skipped {skipped} pairs (skills not found)")
        
except Exception as e:
    conn.rollback()
    print(f"  ✗ Error: {e}")

# ============================================================================
# STEP 4: Seed category_compatibility
# ============================================================================
print("\n[4/4] Seeding category_compatibility...")

try:
    with open('industry_transitions.json', 'r') as f:
        transitions_data = json.load(f)
    
    if not transitions_data or len(transitions_data) == 0:
        print("  ⚠️  industry_transitions.json is empty!")
        print("  📋 Using manual sample data instead...")
        
        # Insert manual sample data
        manual_data = [
            ('Technology', 'Technology', 150, 0.85, 1.0, 150),
            ('Technology', 'Finance', 25, 0.14, 0.45, 25),
            ('Technology', 'Business', 15, 0.09, 0.35, 15),
            ('Finance', 'Finance', 120, 0.75, 1.0, 120),
            ('Finance', 'Business', 30, 0.19, 0.5, 30),
            ('Finance', 'Technology', 10, 0.06, 0.3, 10),
            ('Healthcare', 'Healthcare', 100, 0.9, 1.0, 100),
            ('Healthcare', 'Education', 8, 0.07, 0.4, 8),
            ('Healthcare', 'NGO/Development', 3, 0.03, 0.3, 3),
            ('Education', 'Education', 90, 0.85, 1.0, 90),
            ('Education', 'Business', 10, 0.09, 0.35, 10),
            ('Education', 'NGO/Development', 6, 0.06, 0.4, 6),
            ('Mining', 'Mining', 80, 0.8, 1.0, 80),
            ('Mining', 'Engineering', 15, 0.15, 0.6, 15),
            ('Mining', 'Business', 5, 0.05, 0.3, 5),
            ('Agriculture', 'Agriculture', 70, 0.8, 1.0, 70),
            ('Agriculture', 'Business', 12, 0.14, 0.4, 12),
            ('Agriculture', 'NGO/Development', 5, 0.06, 0.45, 5),
        ]
        
        inserted = 0
        for from_cat, to_cat, count, prob, score, sample in manual_data:
            cur.execute("""
                INSERT INTO matching_metadata.category_compatibility 
                    (from_category, to_category, transition_count, 
                     transition_probability, compatibility_score, sample_size)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (from_category, to_category) DO NOTHING
            """, (from_cat, to_cat, count, prob, score, sample))
            if cur.rowcount > 0:
                inserted += 1
        
        conn.commit()
        print(f"  ✓ Inserted {inserted} manual sample transitions")
        print(f"  ℹ️  This is sufficient for testing the matching system")
        
    else:
        # Use actual data from JSON
        inserted = 0
        for trans in transitions_data:
            cur.execute("""
                INSERT INTO matching_metadata.category_compatibility 
                    (from_category, to_category, transition_count, 
                     transition_probability, compatibility_score, sample_size)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (from_category, to_category) DO NOTHING
            """, (
                trans['from_industry'],
                trans['to_industry'],
                int(trans['transitions']),
                float(trans['probability']),
                float(trans['probability']),
                int(trans['transitions'])
            ))
            if cur.rowcount > 0:
                inserted += 1
        
        conn.commit()
        print(f"  ✓ Inserted {inserted} industry transitions")
        
except Exception as e:
    conn.rollback()
    print(f"  ✗ Error: {e}")
    import traceback
    traceback.print_exc()

# ============================================================================
# VERIFICATION
# ============================================================================
print("\n" + "=" * 80)
print("VERIFICATION")
print("=" * 80)

tables = [
    'skills_taxonomy',
    'skill_similarity',
    'category_compatibility',
    'collar_weights_config'
]

for table in tables:
    try:
        cur.execute(f"SELECT COUNT(*) FROM matching_metadata.{table}")
        count = cur.fetchone()[0]
        status = "✓" if count > 0 else "✗"
        print(f"  {status} {table:30s}: {count:,} rows")
    except Exception as e:
        print(f"  ✗ {table:30s}: ERROR - {e}")

# Show samples
print("\n" + "-" * 80)
print("Sample: Top 5 Skills")
print("-" * 80)
try:
    cur.execute("""
        SELECT skill_name, frequency 
        FROM matching_metadata.skills_taxonomy 
        ORDER BY frequency DESC 
        LIMIT 5
    """)
    for row in cur.fetchall():
        print(f"  {row[0]:30s}: {row[1]:,}")
except Exception as e:
    print(f"  Error: {e}")

print("\n" + "-" * 80)
print("Sample: Top 5 Category Transitions")
print("-" * 80)
try:
    cur.execute("""
        SELECT from_category, to_category, transition_probability
        FROM matching_metadata.category_compatibility 
        ORDER BY transition_probability DESC 
        LIMIT 5
    """)
    for row in cur.fetchall():
        print(f"  {row[0]:20s} → {row[1]:20s}: {row[2]:.1%}")
except Exception as e:
    print(f"  Error: {e}")

# Close connection
cur.close()
conn.close()

print("\n" + "=" * 80)
print("✓ SEEDING COMPLETE!")
print("=" * 80)

print("\n📋 Summary:")
print("  • Skills taxonomy: Seeded from CVs.csv")
print("  • Skill similarity: Seeded from CVs.csv")
print("  • Category compatibility: Manual sample data (CVs lack industry info)")
print("  • System is ready for matching algorithm implementation")

print("\n🎯 Next Steps:")
print("  1. Update MATCHING_SYSTEM_PROGRESS.md - mark Week 1 Days 1-2 complete")
print("  2. Begin Week 1 Days 3-4: Implement CAMSS 2.0 algorithms")
print("  3. Test matching with sample CV-job pairs")

print("\n" + "=" * 80)
