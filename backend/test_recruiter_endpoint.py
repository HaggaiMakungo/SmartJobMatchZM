"""
Quick diagnostic script to test recruiter matching endpoint
"""
import requests
import json

# Configuration
BASE_URL = "http://localhost:8000"
TEST_USER = {
    "username": "zanaco@company.zm",
    "password": "password123"
}

def test_recruiter_endpoint():
    print("\n" + "="*60)
    print("🔍 Testing Recruiter Matching Endpoint")
    print("="*60)
    
    # Step 1: Login
    print("\n1️⃣ Logging in...")
    login_response = requests.post(
        f"{BASE_URL}/api/auth/login",
        data=TEST_USER,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.status_code}")
        print(login_response.text)
        return
    
    token = login_response.json()["access_token"]
    print(f"✅ Login successful! Token: {token[:20]}...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Step 2: Get jobs
    print("\n2️⃣ Fetching jobs...")
    jobs_response = requests.get(
        f"{BASE_URL}/api/corporate/jobs",
        headers=headers
    )
    
    if jobs_response.status_code != 200:
        print(f"❌ Failed to fetch jobs: {jobs_response.status_code}")
        print(jobs_response.text)
        return
    
    jobs_data = jobs_response.json()
    
    # Handle different response formats
    if isinstance(jobs_data, dict):
        jobs = jobs_data.get('jobs', [])
    else:
        jobs = jobs_data
    
    if not jobs:
        print("❌ No jobs found!")
        return
    
    print(f"✅ Found {len(jobs)} jobs")
    
    # Pick first job
    first_job = jobs[0]
    job_id = first_job.get('job_id') or first_job.get('id')
    job_title = first_job.get('title', 'Unknown')
    
    print(f"\n📋 Testing with job: {job_title} (ID: {job_id})")
    
    # Step 3: Test candidate matching endpoints
    endpoints_to_test = [
        f"/api/recruiter/job/{job_id}/candidates",  # Original
        f"/api/recruiter/optimized/job/{job_id}/candidates",  # Optimized
        f"/api/recruiter/job/{job_id}/candidates/cached",  # Cached
    ]
    
    for endpoint in endpoints_to_test:
        print(f"\n3️⃣ Testing: {endpoint}")
        try:
            response = requests.get(
                f"{BASE_URL}{endpoint}",
                headers=headers,
                params={"min_score": 0.0, "limit": 20},
                timeout=30
            )
            
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                candidates = data.get('matched_candidates', data.get('candidates', []))
                print(f"   ✅ Success! Found {len(candidates)} candidates")
                print(f"   Response keys: {list(data.keys())}")
                
                if candidates:
                    print(f"   First candidate: {candidates[0].get('full_name', 'Unknown')}")
                    print(f"   Match score: {candidates[0].get('match_score', 0)}")
            else:
                print(f"   ❌ Failed: {response.text[:200]}")
                
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
    
    print("\n" + "="*60)
    print("✅ Diagnostic complete!")
    print("="*60)

if __name__ == "__main__":
    test_recruiter_endpoint()
