"""
Quick diagnostic script to check what's in the database
"""
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.db.session import get_db
from app.models.corporate_job import CorporateJob
from app.models.cv import CV
from app.models.user import User

# Database connection
DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/camss_db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

print("\n" + "=" * 80)
print("🔍 CAMSS 2.0 - DATABASE DIAGNOSTIC")
print("=" * 80)

# Check companies
print("\n📊 COMPANIES IN DATABASE:")
print("-" * 80)
companies = db.query(CorporateJob.company).distinct().all()
for company in companies[:20]:
    job_count = db.query(CorporateJob).filter(CorporateJob.company == company[0]).count()
    print(f"   • {company[0]}: {job_count} jobs")

# Check DHL specifically
print("\n🚚 DHL JOBS:")
print("-" * 80)
dhl_jobs = db.query(CorporateJob).filter(
    CorporateJob.company.ilike('%dhl%')
).all()
print(f"   Found {len(dhl_jobs)} DHL jobs:")
for job in dhl_jobs[:5]:
    print(f"   • {job.job_id}: {job.title}")

# Check CVs
print("\n👥 CVS IN DATABASE:")
print("-" * 80)
total_cvs = db.query(CV).count()
print(f"   Total CVs: {total_cvs}")

# Sample CVs
sample_cvs = db.query(CV).limit(10).all()
print(f"\n   Sample CVs:")
for cv in sample_cvs:
    print(f"   • {cv.cv_id}: {cv.full_name} - {cv.current_job_title or 'N/A'}")

# Check if there are logistics-related CVs
print("\n🚛 LOGISTICS-RELATED CVS:")
print("-" * 80)
logistics_cvs = db.query(CV).filter(
    (CV.current_job_title.ilike('%logistics%')) |
    (CV.current_job_title.ilike('%driver%')) |
    (CV.current_job_title.ilike('%warehouse%'))
).all()
print(f"   Found {len(logistics_cvs)} logistics CVs:")
for cv in logistics_cvs[:10]:
    print(f"   • {cv.cv_id}: {cv.full_name} - {cv.current_job_title}")

# Check user companies
print("\n🏢 USER ACCOUNTS:")
print("-" * 80)
users = db.query(User).all()
for user in users[:10]:
    company = user.company_name if hasattr(user, 'company_name') and user.company_name else "N/A"
    print(f"   • {user.email}: {company}")

db.close()
print("\n" + "=" * 80)
print("✅ Diagnostic complete!")
print("=" * 80 + "\n")
