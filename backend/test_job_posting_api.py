"""
Test Job Posting API (Phase 1)
Verify POST, PUT, PATCH endpoints work correctly
"""
import requests
import json
from datetime import date, timedelta

BASE_URL = "http://localhost:8000"
TOKEN = None


def login():
    """Login as Zedsafe recruiter"""
    global TOKEN
    
    print("=" * 80)
    print("🔐 LOGGING IN AS ZEDSAFE RECRUITER")
    print("=" * 80)
    
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        data={
            "username": "recruiter@zedsafe.com",
            "password": "test123"
        }
    )
    
    if response.status_code == 200:
        TOKEN = response.json()["access_token"]
        print(f"✅ Login successful! Token: {TOKEN[:30]}...")
        return True
    else:
        print(f"❌ Login failed: {response.status_code}")
        print(response.text)
        return False


def test_create_job():
    """Test POST /corporate/jobs"""
    print("\n" + "=" * 80)
    print("📝 TEST 1: CREATE NEW JOB (POST)")
    print("=" * 80)
    
    job_data = {
        "title": "Supply Chain Manager",
        "category": "Transport",
        "collar_type": "white",
        "description": "Oversee supply chain operations for Zedsafe Logistics. Manage inventory, coordinate with suppliers, and optimize logistics processes. Lead a team of 5 logistics coordinators.",
        "key_responsibilities": "Manage supply chain operations, Coordinate with suppliers, Optimize logistics processes, Lead team of coordinators, Monitor KPIs",
        "required_skills": "Supply Chain Management, Logistics, Inventory Management, MS Excel, Leadership",
        "preferred_skills": "SAP, Six Sigma, Project Management",
        "required_experience_years": 5.0,
        "required_education": "Bachelor's",
        "preferred_certifications": "CSCMP, Six Sigma Green Belt",
        "location_city": "Lusaka",
        "location_province": "Lusaka",
        "salary_min_zmw": 15000.0,
        "salary_max_zmw": 22000.0,
        "employment_type": "Full-time",
        "work_schedule": "Monday-Friday, 8:00-17:00",
        "language_requirements": "English (Fluent), Basic Bemba",
        "benefits": "Health insurance, Pension, Company vehicle, Performance bonus",
        "growth_opportunities": "Path to Operations Director",
        "company_size": "Medium",
        "industry_sector": "Logistics",
        "application_deadline": (date.today() + timedelta(days=30)).isoformat()
    }
    
    headers = {"Authorization": f"Bearer {TOKEN}"}
    
    response = requests.post(
        f"{BASE_URL}/api/corporate/jobs",
        json=job_data,
        headers=headers
    )
    
    print(f"\nStatus Code: {response.status_code}")
    
    if response.status_code == 201:
        job = response.json()
        print("✅ Job created successfully!")
        print(f"\nJob ID: {job['job_id']}")
        print(f"Title: {job['title']}")
        print(f"Company: {job['company']}")
        print(f"Status: {job['status']}")
        print(f"Created At: {job['created_at']}")
        return job['job_id']
    else:
        print(f"❌ Failed to create job")
        print(f"Response: {response.text[:500]}")
        return None


def test_get_jobs():
    """Test GET /corporate/jobs"""
    print("\n" + "=" * 80)
    print("📋 TEST 2: GET JOBS LIST")
    print("=" * 80)
    
    headers = {"Authorization": f"Bearer {TOKEN}"}
    
    response = requests.get(
        f"{BASE_URL}/api/corporate/jobs",
        headers=headers
    )
    
    print(f"\nStatus Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Retrieved jobs successfully!")
        print(f"\nTotal Jobs: {data['total']}")
        print(f"Company: {data['company']}")
        print(f"\nJobs List:")
        for job in data['jobs'][:5]:
            print(f"  • {job['job_id']}: {job['title']} ({job['status']})")
        return data['jobs']
    else:
        print(f"❌ Failed to get jobs")
        print(f"Response: {response.text[:500]}")
        return []


def test_update_job(job_id):
    """Test PUT /corporate/jobs/{job_id}"""
    print("\n" + "=" * 80)
    print(f"✏️ TEST 3: UPDATE JOB (PUT)")
    print("=" * 80)
    
    update_data = {
        "title": "Senior Supply Chain Manager",  # Updated title
        "salary_min_zmw": 18000.0,  # Increased salary
        "salary_max_zmw": 25000.0,
        "description": "Lead supply chain operations for Zedsafe Logistics. Manage inventory, coordinate with suppliers, and optimize logistics processes. Lead a team of 8 logistics coordinators and analysts."
    }
    
    headers = {"Authorization": f"Bearer {TOKEN}"}
    
    response = requests.put(
        f"{BASE_URL}/api/corporate/jobs/{job_id}",
        json=update_data,
        headers=headers
    )
    
    print(f"\nStatus Code: {response.status_code}")
    
    if response.status_code == 200:
        job = response.json()
        print("✅ Job updated successfully!")
        print(f"\nUpdated Fields:")
        print(f"  • Title: {job['title']}")
        print(f"  • Salary: K{job['salary_min_zmw']:,.0f} - K{job['salary_max_zmw']:,.0f}")
        print(f"  • Updated At: {job['updated_at']}")
        return True
    else:
        print(f"❌ Failed to update job")
        print(f"Response: {response.text[:500]}")
        return False


def test_publish_job(job_id):
    """Test PATCH /corporate/jobs/{job_id}/status"""
    print("\n" + "=" * 80)
    print(f"🚀 TEST 4: PUBLISH JOB (PATCH)")
    print("=" * 80)
    
    headers = {"Authorization": f"Bearer {TOKEN}"}
    
    response = requests.patch(
        f"{BASE_URL}/api/corporate/jobs/{job_id}/status?status=published",
        headers=headers
    )
    
    print(f"\nStatus Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Job published successfully!")
        print(f"\nStatus Change:")
        print(f"  • From: {data['old_status']}")
        print(f"  • To: {data['new_status']}")
        print(f"  • Message: {data['message']}")
        return True
    else:
        print(f"❌ Failed to publish job")
        print(f"Response: {response.text[:500]}")
        return False


def test_close_job(job_id):
    """Test closing a job"""
    print("\n" + "=" * 80)
    print(f"🔒 TEST 5: CLOSE JOB (PATCH)")
    print("=" * 80)
    
    headers = {"Authorization": f"Bearer {TOKEN}"}
    
    response = requests.patch(
        f"{BASE_URL}/api/corporate/jobs/{job_id}/status?status=closed",
        headers=headers
    )
    
    print(f"\nStatus Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Job closed successfully!")
        print(f"\nStatus Change:")
        print(f"  • From: {data['old_status']}")
        print(f"  • To: {data['new_status']}")
        return True
    else:
        print(f"❌ Failed to close job")
        print(f"Response: {response.text[:500]}")
        return False


def test_get_stats():
    """Test GET /corporate/stats"""
    print("\n" + "=" * 80)
    print("📊 TEST 6: GET STATISTICS")
    print("=" * 80)
    
    headers = {"Authorization": f"Bearer {TOKEN}"}
    
    response = requests.get(
        f"{BASE_URL}/api/corporate/stats",
        headers=headers
    )
    
    print(f"\nStatus Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Statistics retrieved successfully!")
        print(f"\nCompany: {data['company']}")
        print(f"Total Jobs: {data['total_jobs']}")
        print(f"\nBy Status:")
        for status, count in data['by_status'].items():
            print(f"  • {status}: {count}")
        print(f"\nBy Category:")
        for category, count in data['by_category'].items():
            print(f"  • {category}: {count}")
        return True
    else:
        print(f"❌ Failed to get statistics")
        print(f"Response: {response.text[:500]}")
        return False


def main():
    """Run all tests"""
    print("\n" + "=" * 80)
    print("🧪 PHASE 1: JOB POSTING API TESTS")
    print("=" * 80)
    print("\nTesting endpoints:")
    print("  1. POST /corporate/jobs - Create job")
    print("  2. GET /corporate/jobs - List jobs")
    print("  3. PUT /corporate/jobs/{id} - Update job")
    print("  4. PATCH /corporate/jobs/{id}/status - Publish job")
    print("  5. PATCH /corporate/jobs/{id}/status - Close job")
    print("  6. GET /corporate/stats - Get statistics")
    
    # Login first
    if not login():
        print("\n❌ LOGIN FAILED - Cannot continue tests")
        return
    
    # Test 1: Create job
    job_id = test_create_job()
    if not job_id:
        print("\n❌ JOB CREATION FAILED - Cannot continue tests")
        return
    
    # Test 2: Get jobs list
    test_get_jobs()
    
    # Test 3: Update job
    test_update_job(job_id)
    
    # Test 4: Publish job
    test_publish_job(job_id)
    
    # Test 5: Close job
    test_close_job(job_id)
    
    # Test 6: Get stats
    test_get_stats()
    
    # Final summary
    print("\n" + "=" * 80)
    print("✅ ALL TESTS COMPLETE!")
    print("=" * 80)
    print(f"\nCreated Job ID: {job_id}")
    print("\nNext Steps:")
    print("  1. Check database to verify job was created")
    print("  2. Test the job appears in mobile app (if status=published)")
    print("  3. Build the web dashboard UI (Phase 2)")


if __name__ == "__main__":
    main()
