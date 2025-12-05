"""
Test the updated auth system with corp_users table
"""
import requests
import json

BASE_URL = "http://localhost:8000"

print("🧪 TESTING NEW AUTH SYSTEM")
print("=" * 60)

# Test cases
test_accounts = [
    {"email": "zesco@company.zm", "password": "password123", "expected_company": "ZESCO"},
    {"email": "zanaco@company.zm", "password": "password123", "expected_company": "ZANACO"},
    {"email": "zesco limited@company.zm", "password": "password123", "expected_company": "ZESCO Limited"},
]

for test in test_accounts:
    print(f"\n📧 Testing: {test['email']}")
    print("-" * 60)
    
    # 1. Login
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            data={
                "username": test['email'],
                "password": test['password']
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Login successful!")
            print(f"   Company: {data['user']['company_display_name']}")
            print(f"   Company Name (DB): {data['user']['company_name']}")
            print(f"   Email: {data['user']['email']}")
            
            # Check if company name matches expected
            if data['user']['company_name'] == test['expected_company']:
                print(f"   ✅ Company name matches expected: {test['expected_company']}")
            else:
                print(f"   ⚠️  Company name mismatch!")
                print(f"      Expected: {test['expected_company']}")
                print(f"      Got: {data['user']['company_name']}")
            
            token = data['access_token']
            
            # 2. Get current user info
            me_response = requests.get(
                f"{BASE_URL}/api/auth/me",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            if me_response.status_code == 200:
                me_data = me_response.json()
                print(f"\n   📋 User Info:")
                print(f"      Full Name: {me_data['full_name']}")
                print(f"      Company: {me_data['company_name']}")
                print(f"      Role: {me_data['role']}")
                print(f"      Job Count: {me_data.get('job_count', 'N/A')}")
            
            # 3. Get company jobs
            jobs_response = requests.get(
                f"{BASE_URL}/api/corporate/jobs",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            if jobs_response.status_code == 200:
                jobs = jobs_response.json()
                print(f"\n   💼 Jobs: {len(jobs)} jobs found")
                
                if len(jobs) > 0:
                    print(f"      Sample jobs:")
                    for i, job in enumerate(jobs[:3]):
                        print(f"      - {job.get('title', 'N/A')} ({job.get('company', 'N/A')})") 
                    
                    # Check if all jobs belong to this company
                    company_jobs = [j for j in jobs if j['company'] == test['expected_company']]
                    if len(company_jobs) == len(jobs):
                        print(f"      ✅ All jobs belong to {test['expected_company']}")
                    else:
                        print(f"      ⚠️  Some jobs don't belong to {test['expected_company']}!")
                        other_companies = set([j['company'] for j in jobs if j['company'] != test['expected_company']])
                        print(f"         Other companies: {other_companies}")
                else:
                    print(f"      ⚠️  No jobs found for {test['expected_company']}")
            else:
                print(f"   ❌ Failed to get jobs: {jobs_response.status_code}")
                print(f"      {jobs_response.text}")
        
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(f"   {response.text}")
    
    except Exception as e:
        print(f"❌ Error: {e}")

print("\n" + "=" * 60)
print("✅ AUTH TESTING COMPLETE")
