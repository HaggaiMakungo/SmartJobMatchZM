"""
Quick script to check what data exists in the database.
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
print("DATABASE DATA CHECK")
print("=" * 60)

# Check user_job_interactions
cursor.execute("SELECT COUNT(*) FROM public.user_job_interactions")
interactions_count = cursor.fetchone()[0]
print(f"\n✅ user_job_interactions: {interactions_count} rows")

if interactions_count > 0:
    cursor.execute("SELECT action, COUNT(*) FROM public.user_job_interactions GROUP BY action")
    print("   Actions breakdown:")
    for action, count in cursor.fetchall():
        print(f"   - {action}: {count}")

# Check match_feedback
cursor.execute("SELECT COUNT(*) FROM public.match_feedback")
feedback_count = cursor.fetchone()[0]
print(f"\n✅ match_feedback: {feedback_count} rows")

if feedback_count > 0:
    cursor.execute("SELECT helpful, COUNT(*) FROM public.match_feedback GROUP BY helpful")
    print("   Helpful breakdown:")
    for helpful, count in cursor.fetchall():
        print(f"   - helpful={helpful}: {count}")
    
    cursor.execute("SELECT COUNT(*) FROM public.match_feedback WHERE helpful IS NOT NULL")
    helpful_not_null = cursor.fetchone()[0]
    print(f"   - helpful IS NOT NULL: {helpful_not_null}")

# Check the JOIN
cursor.execute("""
    SELECT COUNT(*) 
    FROM public.user_job_interactions i
    LEFT JOIN public.match_feedback f ON i.event_id = f.match_event_id
    WHERE f.match_event_id IS NOT NULL
""")
joined_count = cursor.fetchone()[0]
print(f"\n✅ Joined interactions with feedback: {joined_count} rows")

# Check with the actual WHERE clause
cursor.execute("""
    SELECT COUNT(*) 
    FROM public.user_job_interactions i
    LEFT JOIN public.match_feedback f ON i.event_id = f.match_event_id
    WHERE f.helpful IS NOT NULL
""")
filtered_count = cursor.fetchone()[0]
print(f"✅ With 'helpful IS NOT NULL': {filtered_count} rows")

# Sample some data
print("\n" + "=" * 60)
print("SAMPLE DATA CHECK")
print("=" * 60)

cursor.execute("""
    SELECT i.event_id, i.action, f.match_event_id, f.helpful
    FROM public.user_job_interactions i
    LEFT JOIN public.match_feedback f ON i.event_id = f.match_event_id
    LIMIT 5
""")
print("\nFirst 5 rows (event_id, action, match_event_id, helpful):")
for row in cursor.fetchall():
    print(f"  {row}")

cursor.close()
conn.close()

print("\n" + "=" * 60)
print("CHECK COMPLETE")
print("=" * 60)
