"""
Diagnostic script to find out why Zesco user only sees 1 job instead of 18
"""
import os
import sys
from sqlalchemy import create_engine, text

# Database connection
DATABASE_URL = "postgresql://postgres:Winter123@localhost:5432/job_match_db"
engine = create_engine(DATABASE_URL)

print("🔍 ZESCO JOBS DIAGNOSTIC\n" + "="*60)

with engine.connect() as conn:
    # 1. Check total jobs in corporate_jobs table
    result = conn.execute(text("SELECT COUNT(*) FROM corporate_jobs;"))
    total_jobs = result.scalar()
    print(f"\n1. Total jobs in database: {total_jobs}")
    
    # 2. Check Zesco user details
    result = conn.execute(text("""
        SELECT id, email, company 
        FROM users 
        WHERE email LIKE '%zesco%';
    """))
    user = result.fetchone()
    if user:
        print(f"\n2. Zesco user found:")
        print(f"   - ID: {user[0]}")
        print(f"   - Email: {user[1]}")
        print(f"   - Company: '{user[2]}'")
    else:
        print("\n2. ❌ No Zesco user found!")
        sys.exit(1)
    
    # 3. Check all unique company names in jobs table
    result = conn.execute(text("""
        SELECT DISTINCT company, COUNT(*) as job_count
        FROM corporate_jobs
        GROUP BY company
        ORDER BY company;
    """))
    companies = result.fetchall()
    print(f"\n3. Companies in corporate_jobs table:")
    for company, count in companies:
        marker = " 👈 ZESCO USER'S COMPANY" if company == user[2] else ""
        print(f"   - '{company}': {count} jobs{marker}")
    
    # 4. Check jobs that match Zesco user's company EXACTLY
    result = conn.execute(text("""
        SELECT job_id, title, company
        FROM corporate_jobs
        WHERE company = :company
        ORDER BY created_at DESC;
    """), {"company": user[2]})
    matching_jobs = result.fetchall()
    print(f"\n4. Jobs matching user company ('{user[2]}') EXACTLY:")
    print(f"   Found: {len(matching_jobs)} jobs")
    if matching_jobs:
        for job_id, title, company in matching_jobs[:5]:  # Show first 5
            print(f"   - [{job_id}] {title}")
        if len(matching_jobs) > 5:
            print(f"   ... and {len(matching_jobs) - 5} more")
    
    # 5. Check case-insensitive match
    result = conn.execute(text("""
        SELECT job_id, title, company
        FROM corporate_jobs
        WHERE LOWER(company) = LOWER(:company)
        ORDER BY created_at DESC;
    """), {"company": user[2]})
    case_insensitive = result.fetchall()
    print(f"\n5. Jobs matching case-insensitive (LOWER('{user[2]}')):")
    print(f"   Found: {len(case_insensitive)} jobs")
    if len(case_insensitive) != len(matching_jobs):
        print("   ⚠️  Case sensitivity issue detected!")
        for job_id, title, company in case_insensitive[:5]:
            print(f"   - [{job_id}] {title} (company: '{company}')")
    
    # 6. Check for partial matches (e.g., "Zesco" vs "ZESCO Limited")
    result = conn.execute(text("""
        SELECT job_id, title, company
        FROM corporate_jobs
        WHERE company ILIKE :pattern
        ORDER BY created_at DESC;
    """), {"pattern": f"%{user[2]}%"})
    partial_matches = result.fetchall()
    print(f"\n6. Jobs with partial match (ILIKE '%{user[2]}%'):")
    print(f"   Found: {len(partial_matches)} jobs")
    if len(partial_matches) > len(matching_jobs):
        print("   ⚠️  Some jobs have different company names!")
        seen = set()
        for job_id, title, company in partial_matches:
            if company not in seen:
                print(f"   - Company variation: '{company}'")
                seen.add(company)
    
    # 7. Check what API endpoint would return
    print(f"\n7. What the API would return:")
    print(f"   Query: SELECT * FROM corporate_jobs WHERE company = '{user[2]}'")
    print(f"   Expected: Should return {len(matching_jobs)} jobs")
    print(f"   Actual (from your logs): 1 job")
    
    # 8. Check if there's a different Zesco spelling
    result = conn.execute(text("""
        SELECT DISTINCT company 
        FROM corporate_jobs
        WHERE company ILIKE '%zesco%';
    """))
    zesco_variants = result.fetchall()
    print(f"\n8. Zesco spelling variants in database:")
    for (variant,) in zesco_variants:
        match = "✅ EXACT MATCH" if variant == user[2] else "❌ DIFFERENT"
        print(f"   - '{variant}' {match}")

print("\n" + "="*60)
print("\n💡 DIAGNOSIS:")

if len(matching_jobs) == 1:
    print("   ✅ The query is working correctly - there IS only 1 Zesco job")
    print("   📝 The '18 jobs' might be from a different data source or outdated info")
elif len(matching_jobs) > 1 and len(matching_jobs) < 18:
    print(f"   ⚠️  Found {len(matching_jobs)} jobs, but you expected 18")
    print("   📝 Check if some jobs were deleted or have different company names")
elif len(partial_matches) > len(matching_jobs):
    print("   ❌ COMPANY NAME MISMATCH ISSUE")
    print(f"   📝 User company: '{user[2]}'")
    print(f"   📝 Job companies have variations - need to standardize!")
    print("\n   🔧 FIX: Run this SQL to standardize:")
    for (variant,) in zesco_variants:
        if variant != user[2]:
            print(f"   UPDATE corporate_jobs SET company = '{user[2]}' WHERE company = '{variant}';")
else:
    print("   ❓ Unexpected scenario - review the output above")

print("\n" + "="*60)
