"""
Quick test to see what data sources are available
"""
from pathlib import Path
import os

backend_dir = Path(__file__).parent
datasets_dir = backend_dir / 'datasets'

print("=" * 80)
print("DATA SOURCE CHECK")
print("=" * 80)

print(f"\nBackend directory: {backend_dir}")
print(f"Datasets directory: {datasets_dir}")
print(f"Datasets exists: {datasets_dir.exists()}")

if datasets_dir.exists():
    files = list(datasets_dir.glob('*.csv'))
    print(f"\nCSV files found: {len(files)}")
    for f in files:
        size = os.path.getsize(f) / (1024*1024)  # MB
        print(f"  - {f.name} ({size:.2f} MB)")
else:
    print("\n❌ Datasets directory not found!")

# Check database
print("\n" + "-" * 80)
print("DATABASE CHECK")
print("-" * 80)

try:
    from app.db.session import SessionLocal
    from app.models import CV, CorporateJob, SmallJob
    
    session = SessionLocal()
    cv_count = session.query(CV).count()
    corp_count = session.query(CorporateJob).count()
    small_count = session.query(SmallJob).count()
    session.close()
    
    print(f"\n✓ Database connected successfully")
    print(f"  - CVs: {cv_count}")
    print(f"  - Corporate Jobs: {corp_count}")
    print(f"  - Small Jobs: {small_count}")
except Exception as e:
    print(f"\n❌ Database error: {e}")

print("\n" + "=" * 80)
