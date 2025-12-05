"""
Test script for Employer Job Management endpoints
"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

# Test credentials
EMAIL = "mark.ziligone@example.com"
PASSWORD = "Mark123"


def test_employer_endpoints():
    """Test all employer job management endpoints"""
    
    print("=" * 80)
    print("TESTING EMPLOYER JOB MANAGEMENT ENDPOINTS")
    print("=" * 80)
    
    # Step 1: Login
    print("\n1. LOGIN AS EMPLOYER")
    print("-" * 80)
    
    login_response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": EMAIL, "password": PASSWORD}
    )
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.status_code}")
        print(login_response.text)
        return
    
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"✅ Login successful! Token: {token[:20]}...")
    
    # Step 2: Get employer stats
    print("\n2. GET EMPLOYER STATS")
    print("-" * 80)
    
    stats_response = requests.get(f"{BASE_URL}/employer/stats", headers=headers)
    
    if stats_response.status_code == 200:
        stats = stats_response.json()
        print(f"✅ Stats retrieved:")
        print(f"   - Total jobs: {stats['stats']['total_jobs']}")
        print(f"   - Active jobs: {stats['stats']['active_jobs']}")
        print(f"   - Completed jobs: {stats['stats']['completed_jobs']}")
        print(f"   - Draft jobs: {stats['stats']['draft_jobs']}")
    else:
        print(f"❌ Failed: {stats_response.status_code}")
        print(stats_response.text)
    
    # Step 3: Create a new job
    print("\n3. CREATE NEW JOB")
    print("-" * 80)
    
    new_job = {
        "title": "Test Driver Position",
        "category": "Driver",
        "description": "Looking for a reliable driver for weekend trips. Must have valid license and clean record.",
        "province": "Lusaka",
        "location": "Kabulonga",
        "budget": 3000.0,
        "payment_type": "Fixed",
        "duration": "Ongoing",
        "status": "Open",
        "posted_by": "1"  # Will be overridden by backend
    }
    
    create_response = requests.post(
        f"{BASE_URL}/employer/jobs",
        headers=headers,
        json=new_job
    )
    
    if create_response.status_code == 201:
        created_job = create_response.json()
        job_id = created_job["id"]
        print(f"✅ Job created successfully!")
        print(f"   - Job ID: {job_id}")
        print(f"   - Title: {created_job['title']}")
        print(f"   - Status: {created_job['status']}")
    else:
        print(f"❌ Failed: {create_response.status_code}")
        print(create_response.text)
        return
    
    # Step 4: Get all employer jobs
    print("\n4. GET ALL EMPLOYER JOBS")
    print("-" * 80)
    
    jobs_response = requests.get(f"{BASE_URL}/employer/jobs", headers=headers)
    
    if jobs_response.status_code == 200:
        jobs_data = jobs_response.json()
        print(f"✅ Retrieved {jobs_data['total']} jobs:")
        for job in jobs_data['jobs'][:3]:  # Show first 3
            print(f"   - {job['title']} ({job['status']})")
    else:
        print(f"❌ Failed: {jobs_response.status_code}")
        print(jobs_response.text)
    
    # Step 5: Get specific job
    print("\n5. GET SPECIFIC JOB")
    print("-" * 80)
    
    job_response = requests.get(f"{BASE_URL}/employer/jobs/{job_id}", headers=headers)
    
    if job_response.status_code == 200:
        job = job_response.json()
        print(f"✅ Job retrieved:")
        print(f"   - Title: {job['title']}")
        print(f"   - Category: {job['category']}")
        print(f"   - Budget: K{job['budget']}")
    else:
        print(f"❌ Failed: {job_response.status_code}")
        print(job_response.text)
    
    # Step 6: Update job
    print("\n6. UPDATE JOB")
    print("-" * 80)
    
    update_data = {
        "title": "UPDATED: Test Driver Position",
        "budget": 3500.0
    }
    
    update_response = requests.put(
        f"{BASE_URL}/employer/jobs/{job_id}",
        headers=headers,
        json=update_data
    )
    
    if update_response.status_code == 200:
        updated_job = update_response.json()
        print(f"✅ Job updated:")
        print(f"   - New title: {updated_job['title']}")
        print(f"   - New budget: K{updated_job['budget']}")
    else:
        print(f"❌ Failed: {update_response.status_code}")
        print(update_response.text)
    
    # Step 7: Update job status
    print("\n7. UPDATE JOB STATUS")
    print("-" * 80)
    
    status_response = requests.patch(
        f"{BASE_URL}/employer/jobs/{job_id}/status?status=In Progress",
        headers=headers
    )
    
    if status_response.status_code == 200:
        result = status_response.json()
        print(f"✅ Status updated: {result['message']}")
    else:
        print(f"❌ Failed: {status_response.status_code}")
        print(status_response.text)
    
    # Step 8: Get jobs filtered by status
    print("\n8. GET JOBS BY STATUS (In Progress)")
    print("-" * 80)
    
    filtered_response = requests.get(
        f"{BASE_URL}/employer/jobs?status=In Progress",
        headers=headers
    )
    
    if filtered_response.status_code == 200:
        filtered_data = filtered_response.json()
        print(f"✅ Found {filtered_data['total']} jobs in progress")
    else:
        print(f"❌ Failed: {filtered_response.status_code}")
        print(filtered_response.text)
    
    # Step 9: Delete job
    print("\n9. DELETE JOB")
    print("-" * 80)
    
    delete_response = requests.delete(
        f"{BASE_URL}/employer/jobs/{job_id}",
        headers=headers
    )
    
    if delete_response.status_code == 204:
        print(f"✅ Job deleted successfully!")
    else:
        print(f"❌ Failed: {delete_response.status_code}")
        print(delete_response.text)
    
    # Step 10: Verify deletion
    print("\n10. VERIFY DELETION")
    print("-" * 80)
    
    verify_response = requests.get(f"{BASE_URL}/employer/jobs/{job_id}", headers=headers)
    
    if verify_response.status_code == 404:
        print(f"✅ Job successfully deleted (404 response confirmed)")
    else:
        print(f"⚠️ Job still exists: {verify_response.status_code}")
    
    print("\n" + "=" * 80)
    print("TEST COMPLETE!")
    print("=" * 80)


if __name__ == "__main__":
    try:
        test_employer_endpoints()
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
