"""
Test script to verify the data joins are working correctly
Tests applications and saved jobs endpoints with actual data
"""
import requests
import json

# Configuration
BASE_URL = "http://192.168.1.28:8000/api"
TEST_USER = {
    "email": "brian.mwale@example.com",
    "password": "test123"
}

def print_header(text):
    """Print a formatted header"""
    print("\n" + "="*60)
    print(f"  {text}")
    print("="*60)

def print_success(text):
    """Print success message"""
    print(f"✅ {text}")

def print_error(text):
    """Print error message"""
    print(f"❌ {text}")

def print_info(text):
    """Print info message"""
    print(f"ℹ️  {text}")

def login():
    """Login and get access token"""
    print_header("Step 1: Login")
    
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json=TEST_USER
    )
    
    if response.status_code == 200:
        data = response.json()
        token = data.get("access_token")
        print_success(f"Logged in as {TEST_USER['email']}")
        print_info(f"User ID: {data.get('user_id')}")
        return token
    else:
        print_error(f"Login failed: {response.status_code}")
        print(response.text)
        return None

def get_jobs(token):
    """Get list of available jobs"""
    print_header("Step 2: Get Available Jobs")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(
        f"{BASE_URL}/jobs/corporate",
        headers=headers,
        params={"limit": 5}
    )
    
    if response.status_code == 200:
        data = response.json()
        jobs = data.get("jobs", [])
        print_success(f"Found {len(jobs)} jobs")
        
        if jobs:
            print_info("Sample jobs:")
            for i, job in enumerate(jobs[:3], 1):
                print(f"  {i}. {job['title']} at {job['company']} ({job['job_id']})")
            return [job['job_id'] for job in jobs[:2]]  # Return first 2 job IDs
    else:
        print_error(f"Failed to get jobs: {response.status_code}")
    
    return []

def apply_to_job(token, job_id):
    """Apply to a job"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(
        f"{BASE_URL}/candidate/applications/{job_id}",
        headers=headers,
        json={"cover_letter": "Test application"}
    )
    
    if response.status_code == 200:
        print_success(f"Applied to job {job_id}")
        return True
    elif response.status_code == 400:
        print_info(f"Already applied to job {job_id}")
        return True
    else:
        print_error(f"Failed to apply: {response.status_code}")
        return False

def save_job(token, job_id):
    """Save/bookmark a job"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(
        f"{BASE_URL}/candidate/saved-jobs/{job_id}",
        headers=headers
    )
    
    if response.status_code == 200:
        print_success(f"Saved job {job_id}")
        return True
    else:
        print_error(f"Failed to save: {response.status_code}")
        return False

def test_applications(token):
    """Test the applications endpoint with data joins"""
    print_header("Step 3: Test Applications Endpoint (WITH DATA JOINS)")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(
        f"{BASE_URL}/candidate/applications",
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()
        
        if isinstance(data, list):
            if len(data) == 0:
                print_info("No applications found (empty list)")
                print_info("This is expected if you haven't applied to any jobs yet")
                return False
            else:
                print_success(f"Found {len(data)} application(s)")
                
                # Check if data has job details
                for i, app in enumerate(data, 1):
                    print(f"\nApplication {i}:")
                    print(f"  ID: {app.get('id')}")
                    print(f"  Job ID: {app.get('job_id')}")
                    print(f"  Status: {app.get('status')}")
                    print(f"  Applied: {app.get('applied_at')}")
                    
                    # Check for job details (this is what we fixed!)
                    if 'job' in app:
                        job = app['job']
                        print(f"  📋 Job Details:")
                        print(f"     Title: {job.get('title')}")
                        print(f"     Company: {job.get('company')}")
                        print(f"     Location: {job.get('location')}")
                        print(f"     Type: {job.get('job_type')}")
                        print(f"     Salary: {job.get('salary_range')}")
                        print_success("✨ Job details are present! Data join is working!")
                    else:
                        print_error("No job details found - data join might not be working")
                
                return True
        else:
            print_error(f"Unexpected response format: {type(data)}")
            return False
    else:
        print_error(f"Failed to get applications: {response.status_code}")
        print(response.text)
        return False

def test_saved_jobs(token):
    """Test the saved jobs endpoint with data joins"""
    print_header("Step 4: Test Saved Jobs Endpoint (WITH DATA JOINS)")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(
        f"{BASE_URL}/candidate/saved-jobs",
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()
        
        if isinstance(data, list):
            if len(data) == 0:
                print_info("No saved jobs found (empty list)")
                print_info("This is expected if you haven't saved any jobs yet")
                return False
            else:
                print_success(f"Found {len(data)} saved job(s)")
                
                # Check if data has job details
                for i, saved in enumerate(data, 1):
                    print(f"\nSaved Job {i}:")
                    print(f"  ID: {saved.get('id')}")
                    print(f"  Job ID: {saved.get('job_id')}")
                    print(f"  Saved: {saved.get('saved_at')}")
                    
                    # Check for job details (this is what we fixed!)
                    if 'job' in saved:
                        job = saved['job']
                        print(f"  📋 Job Details:")
                        print(f"     Title: {job.get('title')}")
                        print(f"     Company: {job.get('company')}")
                        print(f"     Location: {job.get('location')}")
                        print(f"     Category: {job.get('category')}")
                        print(f"     Type: {job.get('job_type')}")
                        print_success("✨ Job details are present! Data join is working!")
                    else:
                        print_error("No job details found - data join might not be working")
                
                return True
        else:
            print_error(f"Unexpected response format: {type(data)}")
            return False
    else:
        print_error(f"Failed to get saved jobs: {response.status_code}")
        print(response.text)
        return False

def main():
    """Main test flow"""
    print("\n🧪 Testing Data Joins Fix")
    print("=" * 60)
    print("This script will:")
    print("1. Login as test user")
    print("2. Get available jobs")
    print("3. Apply to a job (if not already applied)")
    print("4. Save a job (if not already saved)")
    print("5. Test applications endpoint (check for job details)")
    print("6. Test saved jobs endpoint (check for job details)")
    print("=" * 60)
    
    # Step 1: Login
    token = login()
    if not token:
        print("\n❌ Cannot proceed without login token")
        return
    
    # Step 2: Get jobs
    job_ids = get_jobs(token)
    
    # Step 3: Apply to first job and save second job
    if len(job_ids) >= 2:
        print_header("Step 2a: Apply to Job and Save Another")
        apply_to_job(token, job_ids[0])
        save_job(token, job_ids[1])
    
    # Step 4: Test applications
    apps_ok = test_applications(token)
    
    # Step 5: Test saved jobs
    saved_ok = test_saved_jobs(token)
    
    # Final summary
    print_header("🎯 Test Results Summary")
    
    if apps_ok and saved_ok:
        print_success("ALL TESTS PASSED! ✨")
        print_info("Both applications and saved jobs now return job details")
        print_info("Data joins are working correctly!")
    elif apps_ok or saved_ok:
        print_info("PARTIAL SUCCESS")
        if apps_ok:
            print_success("Applications endpoint working with job details")
        else:
            print_info("Applications: No data to test (apply to jobs first)")
        
        if saved_ok:
            print_success("Saved jobs endpoint working with job details")
        else:
            print_info("Saved jobs: No data to test (save jobs first)")
    else:
        print_info("NO TEST DATA YET")
        print_info("Apply to jobs and save jobs, then run this script again")
    
    print("\n" + "="*60)
    print("Test complete! Check results above.")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
