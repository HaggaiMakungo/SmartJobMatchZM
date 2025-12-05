"""
Verify that user companies match job companies
Shows which companies match and which need fixing
"""
from app.db.session import SessionLocal
from sqlalchemy import text

def verify_company_matching():
    """Check if user companies match job companies"""
    db = SessionLocal()
    
    try:
        print("=" * 60)
        print("COMPANY MATCHING VERIFICATION")
        print("=" * 60)
        
        # Get user companies
        print("\n📧 USER COMPANIES:")
        print("-" * 60)
        user_result = db.execute(text("""
            SELECT email, company 
            FROM users 
            WHERE company IS NOT NULL
            ORDER BY company
        """)).fetchall()
        
        user_companies = {}
        for email, company in user_result:
            user_companies[company] = user_companies.get(company, []) + [email]
            print(f"  {email:35s} -> company: '{company}'")
        
        # Get job companies
        print("\n\n💼 JOB COMPANIES:")
        print("-" * 60)
        job_result = db.execute(text("""
            SELECT company, COUNT(*) as count
            FROM corporate_jobs
            GROUP BY company
            ORDER BY company
        """)).fetchall()
        
        job_companies = {company: count for company, count in job_result}
        for company, count in job_result:
            print(f"  {company:35s} -> {count:3d} jobs")
        
        # Compare
        print("\n\n🔍 MATCHING ANALYSIS:")
        print("=" * 60)
        
        perfect_matches = []
        missing_in_jobs = []
        missing_in_users = []
        
        # Check user companies in jobs
        for user_company in user_companies.keys():
            if user_company in job_companies:
                perfect_matches.append((user_company, job_companies[user_company]))
            else:
                missing_in_jobs.append(user_company)
        
        # Check job companies in users
        for job_company in job_companies.keys():
            if job_company not in user_companies:
                missing_in_users.append(job_company)
        
        # Show results
        print("\n✅ PERFECT MATCHES:")
        if perfect_matches:
            for company, job_count in perfect_matches:
                user_count = len(user_companies[company])
                print(f"  • {company:35s} - {user_count} user(s), {job_count} job(s)")
        else:
            print("  None! ❌")
        
        print("\n⚠️  USERS WITHOUT MATCHING JOBS:")
        if missing_in_jobs:
            for company in missing_in_jobs:
                users = ', '.join(user_companies[company])
                print(f"  • {company:35s} - Users: {users}")
                # Suggest similar job companies
                similar = [j for j in job_companies.keys() if company.lower() in j.lower() or j.lower() in company.lower()]
                if similar:
                    print(f"    💡 Similar job companies: {', '.join(similar)}")
        else:
            print("  None! ✅")
        
        print("\n⚠️  JOBS WITHOUT MATCHING USERS:")
        if missing_in_users:
            for company in missing_in_users:
                print(f"  • {company:35s} - {job_companies[company]} jobs (no users)")
        else:
            print("  None! ✅")
        
        # Recommendations
        print("\n\n🔧 RECOMMENDATIONS:")
        print("=" * 60)
        
        if not missing_in_jobs and not missing_in_users:
            print("✅ All companies match perfectly! No action needed.")
        else:
            if missing_in_jobs:
                print("\n1. Fix users with no matching jobs:")
                for user_company in missing_in_jobs:
                    # Find closest match
                    similar = [j for j in job_companies.keys() 
                              if user_company.lower() in j.lower() or j.lower() in user_company.lower()]
                    if similar:
                        suggested = similar[0]
                        print(f"\n   UPDATE users SET company = '{suggested}' WHERE company = '{user_company}';")
            
            if missing_in_users:
                print("\n2. Job companies without users (create test accounts):")
                for job_company in missing_in_users:
                    email = f"{job_company.lower().replace(' ', '')}@company.zm"
                    print(f"   • Create user: {email} for company '{job_company}'")
        
        print("\n" + "=" * 60)
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    verify_company_matching()
