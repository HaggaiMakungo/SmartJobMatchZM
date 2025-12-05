"""
Check User Company Extraction
Diagnostic script to verify company names are being extracted correctly
"""
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.user import User
from app.models.corporate_job import CorporateJob
from app.api.v1.corporate import extract_company_from_user

# Database connection
DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/camss_db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

print("\n" + "=" * 80)
print("🔍 USER COMPANY EXTRACTION TEST")
print("=" * 80)

users = db.query(User).all()

print(f"\nFound {len(users)} users:\n")

for user in users:
    extracted_company = extract_company_from_user(user)
    jobs_count = db.query(CorporateJob).filter(
        CorporateJob.company.ilike(f"%{extracted_company}%")
    ).count()
    
    print(f"📧 {user.email}")
    print(f"   Full Name: {user.full_name or 'N/A'}")
    print(f"   Extracted Company: '{extracted_company}'")
    print(f"   Jobs Found (fuzzy): {jobs_count}")
    
    # Try exact match too
    exact_jobs = db.query(CorporateJob).filter(
        CorporateJob.company == extracted_company
    ).count()
    if exact_jobs > 0:
        print(f"   Jobs Found (exact): {exact_jobs}")
    print()

# Show what companies exist in jobs table
print("\n" + "=" * 80)
print("🏢 COMPANIES IN JOBS TABLE")
print("=" * 80 + "\n")

companies = db.query(CorporateJob.company).distinct().all()
company_counts = {}
for company in companies:
    count = db.query(CorporateJob).filter(
        CorporateJob.company == company[0]
    ).count()
    company_counts[company[0]] = count

# Sort by count descending
for company, count in sorted(company_counts.items(), key=lambda x: x[1], reverse=True):
    print(f"   • {company}: {count} jobs")

# Show potential matches
print("\n" + "=" * 80)
print("🔗 POTENTIAL MATCHES (User Company → Job Company)")
print("=" * 80 + "\n")

for user in users[:10]:  # First 10 users
    extracted = extract_company_from_user(user)
    matches = [c for c in company_counts.keys() if extracted.lower() in c.lower() or c.lower() in extracted.lower()]
    if matches:
        print(f"📧 {user.email} → '{extracted}'")
        for match in matches:
            print(f"      ✓ Matches: {match} ({company_counts[match]} jobs)")
        print()

db.close()

print("=" * 80)
print("✅ Diagnostic complete!")
print("=" * 80 + "\n")
