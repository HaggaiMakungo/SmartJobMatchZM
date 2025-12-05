"""
Check what jobs are in the database
"""
from app.db.session import SessionLocal
from app.models import CorporateJob, SmallJob

session = SessionLocal()

try:
    # Check corporate jobs
    corp_jobs = session.query(CorporateJob).limit(5).all()
    total_corp = session.query(CorporateJob).count()
    
    print("=" * 80)
    print("CORPORATE JOBS")
    print("=" * 80)
    print(f"\n✓ Total: {total_corp} jobs\n")
    
    if corp_jobs:
        print("First 5 corporate jobs:")
        print("-" * 80)
        for job in corp_jobs:
            print(f"ID: {job.job_id}")
            print(f"  Title: {job.title}")
            print(f"  Company: {job.company}")
            print(f"  Category: {job.category}")
            print(f"  Location: {job.location_city}, {job.location_province}")
            print(f"  Education: {job.required_education}")
            print(f"  Experience: {job.required_experience_years} years")
            print()
    
    # Check small jobs
    small_jobs = session.query(SmallJob).limit(5).all()
    total_small = session.query(SmallJob).count()
    
    print("=" * 80)
    print("SMALL JOBS / GIGS")
    print("=" * 80)
    print(f"\n✓ Total: {total_small} jobs\n")
    
    if small_jobs:
        print("First 5 small jobs:")
        print("-" * 80)
        for job in small_jobs:
            print(f"ID: {job.id}")
            print(f"  Title: {job.title}")
            print(f"  Category: {job.category}")
            print(f"  Location: {job.location}, {job.province}")
            print(f"  Budget: {job.budget} ZMW")
            print()
    
    print("=" * 80)
    
finally:
    session.close()
