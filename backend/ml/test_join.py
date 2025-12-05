"""
Test the corrected JOIN
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
print("TESTING CORRECTED JOIN")
print("=" * 60)

# Test the new JOIN on user_id + job_id
cursor.execute("""
    SELECT COUNT(*) 
    FROM public.user_job_interactions i
    LEFT JOIN public.match_feedback f 
        ON i.user_id = f.user_id AND i.job_id = f.job_id
    WHERE f.helpful IS NOT NULL
""")
count = cursor.fetchone()[0]
print(f"\n✅ Rows with new JOIN (user_id + job_id): {count}")

# Sample some joined data
cursor.execute("""
    SELECT 
        i.event_id,
        i.user_id,
        i.job_id,
        i.action,
        f.helpful,
        f.match_event_id
    FROM public.user_job_interactions i
    LEFT JOIN public.match_feedback f 
        ON i.user_id = f.user_id AND i.job_id = f.job_id
    WHERE f.helpful IS NOT NULL
    LIMIT 5
""")

print("\nSample joined data:")
print("event_id | user_id | job_id | action | helpful | match_event_id")
print("-" * 80)
for row in cursor.fetchall():
    print(f"{row[0][:8]}... | {row[1]} | {row[2]} | {row[3]} | {row[4]} | {row[5][:8] if row[5] else 'None'}...")

# Check action distribution
cursor.execute("""
    SELECT 
        i.action,
        COUNT(*) as count
    FROM public.user_job_interactions i
    LEFT JOIN public.match_feedback f 
        ON i.user_id = f.user_id AND i.job_id = f.job_id
    WHERE f.helpful IS NOT NULL
    GROUP BY i.action
    ORDER BY count DESC
""")

print("\n" + "=" * 60)
print("ACTION DISTRIBUTION (with feedback)")
print("=" * 60)
for action, count in cursor.fetchall():
    print(f"{action:15s}: {count:5d} ({count/75:.1f}%)")

cursor.close()
conn.close()

print("\n✅ JOIN TEST COMPLETE")
