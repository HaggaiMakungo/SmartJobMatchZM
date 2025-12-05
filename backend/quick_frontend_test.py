"""
Quick test: Verify frontend API calls will work
"""
import requests

BASE_URL = "http://localhost:8000"

print("🧪 TESTING FRONTEND API CALLS\n")

# Login
print("1. Login...")
login = requests.post(f"{BASE_URL}/api/auth/login", data={
    "username": "recruiter@zedsafe.com",
    "password": "test123"
}, headers={"Content-Type": "application/x-www-form-urlencoded"})

token = login.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}
print(f"   ✅ Token: {token[:30]}...\n")

# Get jobs
print("2. GET /api/jobs/corporate...")
jobs_resp = requests.get(f"{BASE_URL}/api/jobs/corporate", headers=headers)
jobs_data = jobs_resp.json()

print(f"   Response keys: {list(jobs_data.keys())}")
print(f"   Total jobs: {jobs_data.get('total', 0)}")
print(f"   Jobs array length: {len(jobs_data.get('jobs', []))}")

if jobs_data.get('jobs'):
    job = jobs_data['jobs'][0]
    print(f"\n   First job:")
    print(f"      job_id: {job.get('job_id')}")
    print(f"      title: {job.get('title')}")
    print(f"      company: {job.get('company')}")
    
    # Test candidates
    print(f"\n3. GET /api/recruiter/job/{job['job_id']}/candidates...")
    candidates_resp = requests.get(
        f"{BASE_URL}/api/recruiter/job/{job['job_id']}/candidates",
        headers=headers,
        params={"limit": 3, "min_score": 0.25}
    )
    
    cand_data = candidates_resp.json()
    print(f"   Response keys: {list(cand_data.keys())}")
    print(f"   Total candidates: {cand_data.get('total_candidates', 0)}")
    print(f"   Matched candidates: {len(cand_data.get('matched_candidates', []))}")
    
    if cand_data.get('matched_candidates'):
        print(f"\n   Top candidate:")
        c = cand_data['matched_candidates'][0]
        print(f"      {c['full_name']} - {c['match_percentage']}%")

print("\n✅ API READY FOR FRONTEND!")
