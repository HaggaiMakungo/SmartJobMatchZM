"""
Check what company names exist in the jobs database
This helps us ensure user.company values will match job.company values
"""
from app.db.session import SessionLocal
from sqlalchemy import text

def check_job_companies():
    """Show all unique company names in corporate_jobs table"""
    db = SessionLocal()
    
    try:
        print("=" * 60)
        print("COMPANY NAMES IN CORPORATE_JOBS TABLE")
        print("=" * 60)
        
        # Get all unique company names
        result = db.execute(text("""
            SELECT company, COUNT(*) as job_count
            FROM corporate_jobs
            GROUP BY company
            ORDER BY job_count DESC
        """)).fetchall()
        
        print(f"\nFound {len(result)} unique companies:\n")
        
        for company, count in result:
            print(f"  {company:40s} - {count:3d} jobs")
        
        print("\n" + "=" * 60)
        print(f"TOTAL: {len(result)} companies, {sum(c[1] for c in result)} jobs")
        print("=" * 60)
        
        # Show what we'll set in users table
        print("\n📋 RECOMMENDED USER.COMPANY VALUES:")
        print("-" * 60)
        for company, count in result[:10]:  # Top 10
            # Extract company identifier
            company_clean = company.upper() if len(company) <= 4 else company
            print(f"  {company:40s} -> user.company = '{company_clean}'")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    check_job_companies()
