"""
Test the complete flow: Login → Get Jobs → Get Candidates
"""
import requests
import json

BASE_URL = "http://localhost:8000"

print("=" * 80)
print("🧪 COMPLETE FLOW TEST")
print("=" * 80)

# Step 1: Login
print("\n1️⃣ Logging in as Zedsafe recruiter...")
login_response = requests.post(
    f"{BASE_URL}/api/auth/login",
    data={
        "username": "recruiter@zedsafe.com",
        "password": "test123"
    },
    headers={"Content-Type": "application/x-www-form-urlencoded"}
)

if login_response.status_code != 200:
    print(f"   ❌ Login failed: {login_response.text}")
    exit(1)

token = login_response.json()["access_token"]
print(f"   ✅ Login successful! Token: {token[:50]}...")

headers = {"Authorization": f"Bearer {token}"}

# Step 2: Get Jobs
print("\n2️⃣ Fetching jobs...")
jobs_response = requests.get(f"{BASE_URL}/api/jobs/corporate", headers=headers)

if jobs_response.status_code != 200:
    print(f"   ❌ Failed to get jobs: {jobs_response.text}")
    exit(1)

jobs = jobs_response.json()
print(f"   ✅ Got {len(jobs)} jobs")

# Find Zedsafe jobs
zedsafe_jobs = [j for j in jobs if 'zedsafe' in j.get('company', '').lower()]
print(f"   📋 Zedsafe jobs: {len(zedsafe_jobs)}")

if not zedsafe_jobs:
    print("   ❌ No Zedsafe jobs found!")
    exit(1)

# Show first job
job = zedsafe_jobs[0]
print(f"\n   First Zedsafe job:")
print(f"      ID: {job.get('job_id')}")
print(f"      Title: {job.get('title')}")
print(f"      Company: {job.get('company')}")
print(f"      Location: {job.get('location_city')}")

# Step 3: Get Candidates for this job
print(f"\n3️⃣ Fetching candidates for {job.get('title')}...")
candidates_response = requests.get(
    f"{BASE_URL}/api/recruiter/job/{job['job_id']}/candidates",
    headers=headers,
    params={"limit": 5, "min_score": 0.25}
)

print(f"   Status: {candidates_response.status_code}")

if candidates_response.status_code != 200:
    print(f"   ❌ Failed: {candidates_response.text}")
    exit(1)

data = candidates_response.json()
print(f"   ✅ Success!")
print(f"\n   📊 Response structure:")
print(f"      Keys: {list(data.keys())}")
print(f"      Total candidates: {data.get('total_candidates', 0)}")
print(f"      Candidates array length: {len(data.get('matched_candidates', []))}")
print(f"      Processing time: {data.get('processing_time_seconds', 0)}s")

if data.get('matched_candidates'):
    print(f"\n   👥 Top 3 candidates:")
    for i, candidate in enumerate(data['matched_candidates'][:3], 1):
        print(f"\n      {i}. {candidate['full_name']}")
        print(f"         Match: {candidate['match_percentage']}%")
        print(f"         Title: {candidate.get('current_job_title', 'N/A')}")
        print(f"         Location: {candidate.get('city', 'N/A')}")
        print(f"         Email: {candidate.get('email', 'N/A')}")
        print(f"         Skills matched: {len(candidate.get('matched_skills', []))}")
else:
    print(f"   ⚠️  No candidates matched above threshold")

print("\n" + "=" * 80)
print("✅ COMPLETE FLOW TEST PASSED!")
print("=" * 80)
print("\nFrontend should now:")
print("1. Fetch jobs from /api/jobs/corporate ✅")
print("2. Show jobs in dropdown ✅")
print("3. Fetch candidates from /api/recruiter/job/{job_id}/candidates ✅")
print("4. Display candidate cards ✅")
