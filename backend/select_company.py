"""
Interactive Company Account Selector
Helps you quickly login to any company account
"""
from sqlalchemy import create_engine, text
from app.core.config import settings
import webbrowser
import time

def select_company():
    """Interactive company selection for testing"""
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.begin() as conn:
        # Get companies with jobs
        result = conn.execute(text("""
            SELECT 
                c.company_name,
                c.email,
                c.industry,
                COUNT(j.job_id) as job_count
            FROM companies c
            LEFT JOIN corporate_jobs j ON j.company = c.company_name
            GROUP BY c.company_name, c.email, c.industry
            HAVING COUNT(j.job_id) > 0
            ORDER BY COUNT(j.job_id) DESC
            LIMIT 20
        """))
        
        companies = result.fetchall()
        
        if not companies:
            print("\n❌ No companies with jobs found!")
            print("Run create_company_accounts.py first.\n")
            return
        
        print("\n" + "=" * 80)
        print("🏢 SELECT A COMPANY TO LOGIN")
        print("=" * 80)
        print("\n📝 Password for all accounts: password123\n")
        
        for idx, company in enumerate(companies, 1):
            company_name, email, industry, job_count = company
            print(f"{idx:2d}. {company_name:<30} ({job_count} jobs)")
            print(f"    📧 {email}")
            print(f"    🏭 {industry or 'Not specified'}\n")
        
        print("0. Exit\n")
        
        while True:
            try:
                choice = input("Enter company number (1-{}): ".format(len(companies)))
                
                if choice == '0':
                    print("\n👋 Goodbye!\n")
                    return
                
                choice_num = int(choice)
                if 1 <= choice_num <= len(companies):
                    selected = companies[choice_num - 1]
                    company_name, email, industry, job_count = selected
                    
                    print("\n" + "=" * 80)
                    print(f"✅ SELECTED: {company_name}")
                    print("=" * 80)
                    print(f"\n📧 Email: {email}")
                    print(f"🔑 Password: password123")
                    print(f"💼 Jobs Available: {job_count}")
                    print(f"🏭 Industry: {industry or 'Not specified'}")
                    
                    print("\n" + "-" * 80)
                    print("COPY THESE CREDENTIALS:")
                    print("-" * 80)
                    print(f"Email:    {email}")
                    print(f"Password: password123")
                    print("-" * 80)
                    
                    # Ask if user wants to open login page
                    open_browser = input("\nOpen login page in browser? (y/n): ").lower()
                    if open_browser == 'y':
                        print("\n🌐 Opening browser in 2 seconds...")
                        print("Make sure your backend and frontend are running!")
                        time.sleep(2)
                        webbrowser.open('http://localhost:3000/login')
                    
                    print("\n✅ Ready to login!\n")
                    
                    # Ask if they want to select another company
                    another = input("Select another company? (y/n): ").lower()
                    if another != 'y':
                        print("\n👋 Goodbye!\n")
                        return
                    
                    # Show the list again
                    print("\n" + "=" * 80)
                    for idx, company in enumerate(companies, 1):
                        company_name, email, industry, job_count = company
                        print(f"{idx:2d}. {company_name:<30} ({job_count} jobs) - {email}")
                    print("\n0. Exit\n")
                else:
                    print("❌ Invalid number. Please try again.")
            except ValueError:
                print("❌ Please enter a valid number.")
            except KeyboardInterrupt:
                print("\n\n👋 Goodbye!\n")
                return


if __name__ == "__main__":
    select_company()
