"""
Fix ZESCO company name inconsistencies
Normalize all ZESCO variations to 'ZESCO'
"""
import psycopg2
from psycopg2.extras import RealDictCursor

# Database connection
conn = psycopg2.connect(
    dbname="job_match_db",
    user="postgres",
    password="Winter123",
    host="localhost",
    port="5432"
)

cursor = conn.cursor(cursor_factory=RealDictCursor)

print("\n" + "="*70)
print("🔧 NORMALIZING ZESCO COMPANY NAMES")
print("="*70 + "\n")

# Get all ZESCO variations
cursor.execute("""
    SELECT DISTINCT company, COUNT(*) as job_count
    FROM corporate_jobs
    WHERE LOWER(company) LIKE '%zesco%'
       OR LOWER(company) LIKE '%zambia electricity%'
    GROUP BY company
    ORDER BY job_count DESC
""")

variations = cursor.fetchall()

print("Current ZESCO name variations:")
for var in variations:
    print(f"   • '{var['company']}' - {var['job_count']} jobs")

# Normalize all to 'ZESCO'
print("\n🔄 Normalizing all variations to 'ZESCO'...")

cursor.execute("""
    UPDATE corporate_jobs
    SET company = 'ZESCO'
    WHERE LOWER(company) LIKE '%zesco%'
       OR LOWER(company) LIKE '%zambia electricity%'
""")

affected = cursor.rowcount
conn.commit()

print(f"✅ Updated {affected} jobs to use 'ZESCO' as company name")

# Verify
cursor.execute("""
    SELECT COUNT(*) as total
    FROM corporate_jobs
    WHERE company = 'ZESCO'
""")

result = cursor.fetchone()
print(f"✅ ZESCO now has {result['total']} jobs total")

# Update company account if needed
cursor.execute("""
    SELECT company_name, email
    FROM companies
    WHERE LOWER(company_name) LIKE '%zesco%'
""")

company_account = cursor.fetchone()

if company_account:
    if company_account['company_name'] != 'ZESCO':
        print(f"\n🔄 Updating company account from '{company_account['company_name']}' to 'ZESCO'...")
        cursor.execute("""
            UPDATE companies
            SET company_name = 'ZESCO'
            WHERE LOWER(company_name) LIKE '%zesco%'
        """)
        conn.commit()
        print("✅ Company account updated")
    else:
        print(f"\n✅ Company account already set to 'ZESCO'")
    
    print(f"📧 Login email: {company_account['email']}")
else:
    print("\n⚠️  No company account found for ZESCO")
    print("Creating account...")
    
    cursor.execute("""
        INSERT INTO companies (company_id, company_name, email, password_hash, industry, created_at)
        VALUES (
            gen_random_uuid(),
            'ZESCO',
            'zesco@company.zm',
            '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TcxMQJI4IKqjg8T6cW3qGhRN8uQ2',  -- password123
            'Energy & Utilities',
            NOW()
        )
        ON CONFLICT (email) DO NOTHING
    """)
    conn.commit()
    print("✅ ZESCO account created: zesco@company.zm / password123")

# Link jobs to company
print("\n🔗 Linking jobs to ZESCO company account...")

cursor.execute("""
    UPDATE corporate_jobs cj
    SET company_id = (SELECT company_id FROM companies WHERE company_name = 'ZESCO')
    WHERE cj.company = 'ZESCO'
      AND (cj.company_id IS NULL OR cj.company_id != (SELECT company_id FROM companies WHERE company_name = 'ZESCO'))
""")

linked = cursor.rowcount
conn.commit()

print(f"✅ Linked {linked} jobs to ZESCO company account")

# Final summary
print("\n" + "="*70)
print("✅ NORMALIZATION COMPLETE")
print("="*70)
print("\nZESCO Account Details:")
print("   Email: zesco@company.zm")
print("   Password: password123")
print(f"   Total Jobs: {result['total']}")
print("\nYou can now login and see all 23 ZESCO jobs!")

cursor.close()
conn.close()
