"""
Clear database using psql command
"""
import subprocess
import sys

print("=" * 80)
print("CLEAR DATABASE TABLES")
print("=" * 80)

print("\n⚠️  WARNING: This will delete ALL data from all tables!")
response = input("Are you sure you want to continue? (yes/no): ")

if response.lower() != 'yes':
    print("Aborted.")
    sys.exit(0)

print("\n[1/1] Clearing all tables using psql...")

# SQL command to truncate all tables
sql_command = """
TRUNCATE TABLE 
    user_job_interactions,
    match_feedback,
    industry_transitions,
    skill_cooccurrence,
    skills_taxonomy,
    small_jobs,
    corporate_jobs,
    cvs 
CASCADE;
"""

try:
    # Run psql command
    result = subprocess.run(
        ['psql', '-U', 'postgres', '-d', 'job_match_db', '-c', sql_command],
        capture_output=True,
        text=True,
        check=True
    )
    
    print("✓ All tables cleared successfully")
    print("\nNow run: python seed_database.py")
    
except subprocess.CalledProcessError as e:
    print(f"✗ Error clearing tables: {e.stderr}")
    print("\nTry running this manually:")
    print("1. psql -U postgres -d job_match_db")
    print("2. TRUNCATE TABLE cvs, corporate_jobs, small_jobs, skills_taxonomy, skill_cooccurrence, industry_transitions, user_job_interactions, match_feedback CASCADE;")
    print("3. \\q")
    sys.exit(1)
except FileNotFoundError:
    print("✗ psql command not found")
    print("\nManual steps:")
    print("1. Open Command Prompt")
    print("2. Run: psql -U postgres -d job_match_db")
    print("3. Paste: TRUNCATE TABLE cvs, corporate_jobs, small_jobs, skills_taxonomy, skill_cooccurrence, industry_transitions CASCADE;")
    print("4. Run: \\q")
    sys.exit(1)
