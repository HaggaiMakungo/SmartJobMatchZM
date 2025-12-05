"""
Check ZESCO's jobs in the database
"""
import psycopg2
from psycopg2.extras import RealDictCursor

# Database connection
conn = psycopg2.connect(
    dbname="job_match_db",
    user="postgres",
    password="Winter123",  # Updated from config.py
    host="localhost",
    port="5432"
)

cursor = conn.cursor(cursor_factory=RealDictCursor)

# Get all ZESCO jobs
print("\n" + "="*70)
print("🏢 ZESCO JOBS IN DATABASE")
print("="*70 + "\n")

cursor.execute("""
    SELECT 
        job_id,
        title,
        company,
        location_city,
        location_province,
        salary_min_zmw,
        salary_max_zmw,
        required_skills,
        posted_date
    FROM corporate_jobs
    WHERE LOWER(company) LIKE '%zesco%'
    ORDER BY posted_date DESC
""")

jobs = cursor.fetchall()

if not jobs:
    print("❌ No ZESCO jobs found in database!")
    print("\n💡 Possible reasons:")
    print("   1. Company name is spelled differently (e.g., 'ZESCO Limited')")
    print("   2. Jobs haven't been added yet")
    print("   3. Jobs are in a different table")
else:
    print(f"✅ Found {len(jobs)} ZESCO job(s):\n")
    
    for i, job in enumerate(jobs, 1):
        print(f"{i}. {job['title']}")
        print(f"   Job ID: {job['job_id']}")
        print(f"   Location: {job['location_city']}, {job['location_province']}")
        print(f"   Salary: K{job['salary_min_zmw']:,.0f} - K{job['salary_max_zmw']:,.0f}")
        print(f"   Required Skills: {job['required_skills'][:100]}...")
        print(f"   Posted: {job['posted_date']}")
        print()

# Also check for similar company names
print("\n" + "="*70)
print("🔍 SIMILAR COMPANY NAMES")
print("="*70 + "\n")

cursor.execute("""
    SELECT DISTINCT company
    FROM corporate_jobs
    WHERE LOWER(company) LIKE '%zesc%'
       OR LOWER(company) LIKE '%electric%'
       OR LOWER(company) LIKE '%power%'
    ORDER BY company
""")

similar = cursor.fetchall()

if similar:
    print("Found similar companies:")
    for row in similar:
        print(f"   • {row['company']}")
else:
    print("No similar companies found.")

# Get company with most jobs for comparison
print("\n" + "="*70)
print("📊 TOP 5 COMPANIES BY JOB COUNT")
print("="*70 + "\n")

cursor.execute("""
    SELECT 
        company,
        COUNT(*) as job_count
    FROM corporate_jobs
    GROUP BY company
    ORDER BY job_count DESC
    LIMIT 5
""")

top_companies = cursor.fetchall()

for i, row in enumerate(top_companies, 1):
    print(f"{i}. {row['company']}: {row['job_count']} jobs")

cursor.close()
conn.close()
