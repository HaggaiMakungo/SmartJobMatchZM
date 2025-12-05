"""
Check what CVs are actually in the database
"""
from app.db.session import SessionLocal
from app.models import CV

session = SessionLocal()

try:
    # Get first 10 CVs
    cvs = session.query(CV).limit(10).all()
    
    print("=" * 80)
    print("AVAILABLE CVs IN DATABASE")
    print("=" * 80)
    
    if not cvs:
        print("❌ No CVs found in database!")
    else:
        print(f"\n✓ Found {session.query(CV).count()} total CVs\n")
        print("First 10 CVs:")
        print("-" * 80)
        for cv in cvs:
            print(f"ID: {cv.cv_id}")
            print(f"  Name: {cv.full_name}")
            print(f"  Email: {cv.email}")
            print(f"  Education: {cv.education_level}")
            print(f"  Experience: {cv.total_years_experience} years")
            print(f"  Location: {cv.city}, {cv.province}")
            print(f"  Skills: {cv.skills_technical[:100] if cv.skills_technical else 'None'}...")
            print()
    
    print("=" * 80)
    
finally:
    session.close()
