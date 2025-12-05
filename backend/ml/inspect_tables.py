"""
Check match_feedback table structure and sample data
"""
import psycopg2

DB_CONFIG = {
    'host': 'localhost',
    'database': 'job_match_db',
    'user': 'postgres',
    'password': 'Winter123'
}

conn = psycopg2.connect(**DB_CONFIG)
cursor = conn.cursor()

print("=" * 60)
print("MATCH_FEEDBACK TABLE INSPECTION")
print("=" * 60)

# Get column names
cursor.execute("""
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'match_feedback'
    ORDER BY ordinal_position
""")
print("\nColumns in match_feedback:")
for col_name, data_type in cursor.fetchall():
    print(f"  - {col_name} ({data_type})")

# Sample data
cursor.execute("SELECT * FROM public.match_feedback LIMIT 3")
columns = [desc[0] for desc in cursor.description]
print(f"\nSample data (first 3 rows):")
print(f"Columns: {columns}")
for row in cursor.fetchall():
    print(f"  {row}")

# Check user_job_interactions structure too
print("\n" + "=" * 60)
print("USER_JOB_INTERACTIONS TABLE INSPECTION")
print("=" * 60)

cursor.execute("""
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_job_interactions'
    ORDER BY ordinal_position
""")
print("\nColumns in user_job_interactions:")
for col_name, data_type in cursor.fetchall():
    print(f"  - {col_name} ({data_type})")

# Sample data
cursor.execute("SELECT * FROM public.user_job_interactions LIMIT 3")
columns = [desc[0] for desc in cursor.description]
print(f"\nSample data (first 3 rows):")
print(f"Columns: {columns}")
for row in cursor.fetchall():
    print(f"  {row}")

cursor.close()
conn.close()

print("\n" + "=" * 60)
