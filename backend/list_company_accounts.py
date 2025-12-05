"""
List all company accounts available for login
Shows email, password, and job count for each company
"""
from sqlalchemy import create_engine, text
from app.core.config import settings

def list_companies():
    """List all company accounts with their credentials and job counts"""
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.begin() as conn:
        # Get all companies with their job counts
        result = conn.execute(text("""
            SELECT 
                c.company_id,
                c.company_name,
                c.email,
                c.industry,
                COUNT(j.job_id) as job_count,
                c.created_at
            FROM companies c
            LEFT JOIN corporate_jobs j ON j.company = c.company_name
            GROUP BY c.company_id, c.company_name, c.email, c.industry, c.created_at
            ORDER BY job_count DESC, c.company_name
        """))
        
        companies = result.fetchall()
        
        if not companies:
            print("\n❌ No companies found in database!")
            print("Run create_company_accounts.py first to create accounts.\n")
            return
        
        print("\n" + "=" * 100)
        print("🏢 AVAILABLE COMPANY ACCOUNTS")
        print("=" * 100)
        print(f"\nTotal Companies: {len(companies)}")
        print("\n📝 Default Password: password123")
        print("\n" + "-" * 100)
        
        # Group by job count
        companies_with_jobs = [c for c in companies if c[4] > 0]
        companies_without_jobs = [c for c in companies if c[4] == 0]
        
        if companies_with_jobs:
            print("\n✅ COMPANIES WITH JOBS (Best for Testing):")
            print("-" * 100)
            for idx, company in enumerate(companies_with_jobs[:20], 1):  # Show top 20
                company_id, company_name, email, industry, job_count, created_at = company
                print(f"\n{idx}. {company_name}")
                print(f"   📧 Email: {email}")
                print(f"   🔑 Password: password123")
                print(f"   🏭 Industry: {industry or 'Not specified'}")
                print(f"   💼 Jobs: {job_count}")
                print(f"   📅 Created: {created_at.strftime('%Y-%m-%d')}")
        
        if companies_without_jobs and len(companies_without_jobs) <= 10:
            print("\n\n⚠️  COMPANIES WITHOUT JOBS:")
            print("-" * 100)
            for company in companies_without_jobs:
                company_id, company_name, email, industry, job_count, created_at = company
                print(f"\n   {company_name}")
                print(f"   📧 Email: {email}")
                print(f"   🔑 Password: password123")
        elif companies_without_jobs:
            print(f"\n\n⚠️  {len(companies_without_jobs)} companies have no jobs posted")
        
        print("\n" + "=" * 100)
        print("\n🚀 TO LOGIN:")
        print("   1. Start backend: python -m uvicorn app.main:app --reload")
        print("   2. Start frontend: cd frontend/recruiter && npm run dev")
        print("   3. Go to: http://localhost:3000/login")
        print("   4. Use any email above with password: password123")
        print("\n" + "=" * 100)
        
        # Show some quick stats
        print("\n📊 QUICK STATS:")
        total_jobs = sum(c[4] for c in companies)
        avg_jobs = total_jobs / len(companies) if companies else 0
        print(f"   Total Jobs: {total_jobs}")
        print(f"   Avg Jobs per Company: {avg_jobs:.1f}")
        print(f"   Companies with Jobs: {len(companies_with_jobs)}")
        print(f"   Companies without Jobs: {len(companies_without_jobs)}")
        print()


if __name__ == "__main__":
    list_companies()
